import { normalizePathname } from "../router";
import { getPage, getPageProps, PageNotFoundError } from "./pages";
import { render } from "./render";
import {
  PERMANENT_REDIRECT_STATUS,
  TEMPORARY_REDIRECT_STATUS,
} from "../constants";
import { config } from "./flareact.config";

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

    if (config && typeof config.redirects) {
      const reducedRedirect = config.redirects.find(
        (item) => item.source === normalizedPathname
      );
      if (reducedRedirect) {
        const statusCode = reducedRedirect.permanent
          ? PERMANENT_REDIRECT_STATUS
          : TEMPORARY_REDIRECT_STATUS;
        const headers = {
          Location: reducedRedirect.destination
        };
        return new Response(null, { status: statusCode, headers: headers });
      }
    }

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
      async (page, props) => {
        const html = await render({
          page,
          props,
          context,
          event,
          buildManifest,
        });

        let statusCode = 200;

        if (typeof props.notFound !== "undefined" && props.notFound === true) {
            statusCode = 404;
        }

        let headers = { "content-type": "text/html" }

        if (typeof props.customHeaders !== "undefined") {
          headers = {...headers, ...props.customHeaders};
        }

        return new Response(html, {
          status: statusCode,
          headers: headers,
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
  const url = new URL(event.request.url);
  const cache = caches.default;
  const cacheKey = getCacheKey(event.request);
  const cachedResponse = await cache.match(cacheKey);

  if (!dev && cachedResponse) return cachedResponse;

  const page = getPage(normalizedPathname, context);
  const props = await getPageProps(page, query, event);

  /*
   * Redirect value to allow redirecting in the edge. This is an optional value.
   */
  if (props && typeof props.redirect !== "undefined") {
    const { redirect = {} } = props;
    const statusCode =
      redirect.statusCode ||
      (redirect.permanent
        ? PERMANENT_REDIRECT_STATUS
        : TEMPORARY_REDIRECT_STATUS);
      const headers = {
        Location: redirect.destination
      };
      return new Response(null, { status: statusCode, headers: headers });
  }

  let response = await generateResponse(page, props);

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
