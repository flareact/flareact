import ReactDOMServer from "react-dom/server";
import Document from "../components/_document";
import { RouterProvider } from "../router";
import App from "../components/_app";
import { getPage, getPageProps } from "./pages";

function pageIsApi(page) {
  return /^\/api\/.+/.test(page);
}

export async function handleRequest(event, fallback) {
  const url = new URL(event.request.url);
  const { pathname } = url;

  try {
    if (pathname.startsWith("/_flareact")) {
      const pagePath = pathname.replace(/\/_flareact|\.json/g, "");
      const page = await getPage(pagePath);
      const props = await getPageProps(page);

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

    const pagePath = pathname === "/" ? "/index" : pathname;

    const page = await getPage(pagePath);

    if (pageIsApi(pagePath)) {
      return await page.default(event);
    }

    const Component = page.default;
    const props = await getPageProps(page);

    const html = ReactDOMServer.renderToString(
      <Document initialData={props}>
        <RouterProvider initialUrl={event.request.url}>
          <App Component={Component} pageProps={props} />
        </RouterProvider>
      </Document>
    );

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

class PageNotFoundError extends Error {}
