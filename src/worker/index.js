import { normalizePathname } from "../router";
import { getPage, getPageProps, PageNotFoundError } from "./pages";
import { render } from "./render";

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
      pathname,
      query,
      async (page, props) => {
        const html = await render({
          page,
          props,
          context,
          event,
          buildManifest,
        });

        return new Response(html, {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      },
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
  pathname,
  query,
  generateHtmlResponse,
  generatePropsResponse
) {
  const cache = caches.default;
  const cacheKey = getCacheKey(event.request);
  const cachedResponse = await cache.match(cacheKey);

  if (!dev && cachedResponse) return cachedResponse;

  let normalizedPathname = normalizePathname(pathname);
  const propsRequest = pathname.startsWith("/_flareact/props");

  if (propsRequest) {
    normalizedPathname = normalizedPathname.replace(/\/_flareact\/props|\.json/g, "");
  }

  const propsCacheKey = propsRequest ? cacheKey : getPropsCacheKey(event.request);

  const page = getPage(normalizedPathname, context);
  let props = undefined; 
  let shouldGeneratePropsResponse = true;

  if (!propsRequest) {
    // Check if props already cached for the requested page
    const cachedProps = await cache.match(propsCacheKey);
    if (cachedProps) {
      ({ pageProps: props } = await cachedProps.json());
      // Cached props found, skip creating props response
      shouldGeneratePropsResponse = false;
    }
  }

  if (!props) {
    props = await getPageProps(page, query, event);
  }

  let propsResponse = undefined;
  let htmlResponse = undefined;

  // No cached props found, create props response to be cached regardless of request type
  if (shouldGeneratePropsResponse) {
    propsResponse = await generatePropsResponse(page, props);
  }

  if (!propsRequest) {
    htmlResponse = await generateHtmlResponse(page, props);
  }

  // Cache by default
  let shouldCache = true;

  if (props && typeof props.revalidate !== "undefined") {
    // Disable cache if the user has explicitly returned { revalidate: 0 } in `getEdgeProps`
    if (props.revalidate === 0) {
      shouldCache = false;
    } else {
      if (propsResponse) {
        propsResponse.headers.append("Cache-Control", `max-age=${props.revalidate}`);
      }
      if (htmlResponse) {
        htmlResponse.headers.append("Cache-Control", `max-age=${props.revalidate}`);
      }
    }
  }

  if (shouldCache) {
    if (propsResponse) {
      await cache.put(propsCacheKey, propsResponse.clone());
    }
    if (htmlResponse) {
      await cache.put(cacheKey, htmlResponse.clone());
    }
  }

  return propsRequest ? propsResponse : htmlResponse;
}

function getPropsCacheKey(request) {
  const url = new URL(request.url);
  const propsUrl = `${url.origin}/_flareact/props${url.pathname}.json${url.search}/${process.env.BUILD_ID}`;
  return new Request(new URL(propsUrl).toString(), request);
}

function getCacheKey(request) {
  const url = request.url + "/" + process.env.BUILD_ID;
  return new Request(new URL(url).toString(), request);
}

function pageIsApi(page) {
  return /^\/api\/.+/.test(page);
}
