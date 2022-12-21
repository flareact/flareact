import { normalizePathname } from "../router";
import { getPage, getPageProps, PageNotFoundError, resolvePagePath } from "./pages";
import { render } from "./render";
import {
  PERMANENT_REDIRECT_STATUS,
  TEMPORARY_REDIRECT_STATUS,
} from "../constants";
import { config } from "./flareact.config";

const CACHEABLE_REQUEST_METHODS = ["GET", "HEAD"];

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
    const pagePath = pathname.replace(/\/_flareact\/props|\.json/g, "");

    const normalizedPathname = normalizePathname(pagePath);
    const resolvedPage = resolvePagePath(normalizedPathname, context.keys());
    const resolvedPagePath = resolvedPage ? resolvedPage.pagePath : null;

    let reducedRedirect;

    if (config && typeof config.redirects !== "undefined") {
      reducedRedirect = config.redirects.find(
        (item) => item.source === normalizedPathname || item.source === resolvedPagePath
      );
    }

    if (pathname.startsWith("/_flareact/props")) {
      return await handleCachedPageRequest(
        event,
        context,
        pagePath,
        query,
        reducedRedirect,
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

    if (reducedRedirect) {
      const statusCode = reducedRedirect.permanent
        ? PERMANENT_REDIRECT_STATUS
        : TEMPORARY_REDIRECT_STATUS;
      let destination = reducedRedirect.destination;

      if (resolvedPage && resolvedPage.params) {
        for (const param in resolvedPage.params) {
          const regex = new RegExp(`\\[${param}\\]`);

          destination = destination.replace(regex, resolvedPage.params[param]);
        }
      }

      const headers = {
        Location: destination
      };
      return new Response(null, { status: statusCode, headers: headers });
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
      null,
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

        let headers = { "content-type": "text/html" };

        if (typeof props.customHeaders !== "undefined") {
          headers = { ...headers, ...props.customHeaders };
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
  staticRedirect,
  generateResponse
) {
  const url = new URL(event.request.url);
  const { pathname } = url;
  const cache = caches.default;
  const cacheKey = getCacheKey(event.request);
  const cachedResponse = await cache.match(cacheKey);

  if (!dev && cachedResponse) return cachedResponse;

  const page = getPage(normalizedPathname, context);
  const props = await getPageProps(page, query, event);

  if (staticRedirect) {
    props.redirect = staticRedirect;
  }

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

      let asPath = redirect.destination;

      if (page.params) {
        for (const param in page.params) {
          const regex = new RegExp(`\\[${param}\\]`);

          asPath = asPath.replace(regex, page.params[param]);
        }
      }

      if (!pathname.startsWith("/_flareact/props")) {
        const headers = {
          Location: asPath
        };
        return new Response(null, { status: statusCode, headers: headers });
      } else {
        redirect.as = asPath;
        props.redirect = redirect;
      }
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

  // This API only supports caching of GET or HEAD request methods
  if (shouldCache && CACHEABLE_REQUEST_METHODS.includes(event.request.method)) {
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
