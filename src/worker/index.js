import React from "react";
import ReactDOMServer from "react-dom/server";
import Document from "../components/_document";
import { RouterProvider, normalizePathname } from "../router";
import { getPage, getPageProps, PageNotFoundError } from "./pages";
import AppProvider from "../components/AppProvider";
import { Helmet } from "react-helmet";

const dev =
  (typeof DEV !== "undefined" && !!DEV) ||
  process.env.NODE_ENV !== "production";

const buildManifest = dev ? {} : process.env.BUILD_MANIFEST;

export async function handleRequest(event, context, fallback) {
  const url = new URL(event.request.url);
  const { pathname, searchParams } = url;
  const query = Object.fromEntries(searchParams.entries());

  if (pathname.startsWith("/_flareact/static")) {
    return await fallback(event);
  }

  try {
    if (pathname.startsWith("/_flareact/props")) {
      const pagePath = pathname.replace(/\/_flareact\/props|\.json/g, "");

      return await handleCachedPageRequest(
        event,
        context,
        pagePath,
        query,
        (_, props) => {
          return new Response(
            JSON.stringify({
              pageProps: props,
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json",
              },
            }
          );
        }
      );
    }

    const normalizedPathname = normalizePathname(pathname);

    if (pageIsApi(normalizedPathname)) {
      const page = getPage(normalizedPathname, context);
      const response = await page.default(event);

      if (response instanceof Object && !(response instanceof Response)) {
        return new Response(JSON.stringify(response), {
          headers: {
            "content-type": "application/json",
          },
        });
      }

      if (!(response instanceof Response)) {
        return new Response(response);
      }

      return response;
    }

    return await handleCachedPageRequest(
      event,
      context,
      normalizedPathname,
      query,
      (page, props) => {
        const Component = page.default;
        const App = getPage("/_app", context).default;

        const content = ReactDOMServer.renderToString(
          <RouterProvider
            initialUrl={event.request.url}
            initialPagePath={page.pagePath}
          >
            <AppProvider
              Component={Component}
              App={App}
              pageProps={props}
              context={context}
            />
          </RouterProvider>
        );

        const pageProps = {
          props,
          page,
        };

        const helmet = Helmet.renderStatic();
        let html = ReactDOMServer.renderToString(
          <Document
            initialData={pageProps}
            helmet={helmet}
            page={page}
            context={context}
            buildManifest={buildManifest}
          />
        );

        html = html.replace(
          `<div id="__flareact"></div>`,
          `<div id="__flareact">${content}</div>`
        );

        html = "<!DOCTYPE html>" + html;

        return new Response(html, {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      }
    );
  } catch (e) {
    if (e instanceof PageNotFoundError) {
      return await fallback(event);
    }

    throw e;
  }
}

async function handleCachedPageRequest(
  event,
  context,
  normalizedPathname,
  query,
  generateResponse
) {
  const cache = caches.default;
  const cacheKey = getCacheKey(event.request);
  const cachedResponse = await cache.match(cacheKey);

  if (!dev && cachedResponse) return cachedResponse;

  const page = getPage(normalizedPathname, context);
  const props = await getPageProps(page, query);

  let response = generateResponse(page, props);

  // Cache by default
  let shouldCache = true;

  if (props && typeof props.revalidate !== "undefined") {
    // Disable cache if the user has explicitly returned { revalidate: 0 } in `getEdgeProps`
    if (props.revalidate === 0) {
      shouldCache = false;
    } else {
      response.headers.append("Cache-Control", `max-age=${props.revalidate}`);
    }
  }

  if (shouldCache) {
    await cache.put(cacheKey, response.clone());
  }

  return response;
}

function getCacheKey(request) {
  const url = request.url + "/" + process.env.BUILD_ID;
  return new Request(new URL(url).toString(), request);
}

function pageIsApi(page) {
  return /^\/api\/.+/.test(page);
}
