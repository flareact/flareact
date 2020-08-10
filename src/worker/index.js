import React from "react";
import ReactDOMServer from "react-dom/server";
import Document from "../components/_document";
import { RouterProvider } from "../router";
import { getPage, getPageProps, PageNotFoundError } from "./pages";
import AppProvider from "../components/AppProvider";
import { Helmet } from "react-helmet";

const dev = !!process.env.DEV;

function pageIsApi(page) {
  return /^\/api\/.+/.test(page);
}

export async function handleRequest(event, context, fallback) {
  const url = new URL(event.request.url);
  const { pathname } = url;

  try {
    if (pathname.startsWith("/_flareact")) {
      return await handlePropsRequest(event, context, pathname);
    }

    const pagePath = pathname === "/" ? "/index" : pathname;

    const page = getPage(pagePath, context);

    if (pageIsApi(pagePath)) {
      return await page.default(event);
    }

    const Component = page.default;
    const props = await getPageProps(page);

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
  } catch (e) {
    if (e instanceof PageNotFoundError) {
      return await fallback(event);
    }

    throw e;
  }
}

async function handlePropsRequest(event, context, pathname) {
  const cache = caches.default;
  const cacheKey = getCacheKey(event.request);
  const cachedResponse = await cache.match(cacheKey);

  if (!dev && cachedResponse) return cachedResponse;

  const pagePath = pathname.replace(/\/_flareact|\.json/g, "");
  const page = getPage(pagePath, context);
  const props = await getPageProps(page);

  // TODO: Add cache headers
  const response = new Response(
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

  await cache.put(event.request, response.clone());

  return response;
}

function getCacheKey(request) {
  return new Request(new URL(request.url).toString(), request);
}
