import React from "react";
import ReactDOMServer from "react-dom/server";
import Document from "../components/_document";
import { RouterProvider } from "../router";
import { getPage, getPageProps, PageNotFoundError } from "./pages";
import AppProvider from "../components/AppProvider";
import { Helmet } from "react-helmet";

const dev =
  (typeof DEV !== "undefined" && !!DEV) ||
  process.env.NODE_ENV !== "production";

function pageIsApi(page) {
  return /^\/api\/.+/.test(page);
}

export async function handleRequest(event, context, fallback) {
  const url = new URL(event.request.url);
  const { pathname } = url;

  try {
    if (pathname.startsWith("/_flareact")) {
      const pagePath = pathname.replace(/\/_flareact|\.json/g, "");

      return await handleCachedPageRequest(
        event,
        context,
        pagePath,
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

    const pagePath = pathname === "/" ? "/index" : pathname;

    if (pageIsApi(pagePath)) {
      const page = getPage(pagePath, context);
      return await page.default(event);
    }

    return await handleCachedPageRequest(
      event,
      context,
      pagePath,
      (page, props) => {
        const Component = page.default;
        const content = ReactDOMServer.renderToString(
          <RouterProvider initialUrl={event.request.url}>
            <AppProvider
              Component={Component}
              pageProps={props}
              context={context}
            />
          </RouterProvider>
        );

        const helmet = Helmet.renderStatic();
        let html = ReactDOMServer.renderToString(
          <Document initialData={props} helmet={helmet} />
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
  pagePath,
  generateResponse
) {
  const cache = caches.default;
  const cacheKey = getCacheKey(event.request);
  const cachedResponse = await cache.match(cacheKey);

  if (!dev && cachedResponse) return cachedResponse;

  const page = getPage(pagePath, context);
  const props = await getPageProps(page);

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
