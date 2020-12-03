import React from "react";
import ReactDOMServer from "react-dom/server";
import { Helmet } from "react-helmet";
import AppProvider from "../components/AppProvider";
import { RouterProvider } from "../router";
import { getPage } from "./pages";

export async function render({ page, props, context, event, buildManifest }) {
  const Component = page.default;
  const App = getPage("/_app", context).default;
  const Document = getPage("/_document", context).default;

  const renderPage = (options) => {
    const EnhancedApp = options.enhanceApp ? options.enhanceApp(App) : App;

    const html = ReactDOMServer.renderToString(
      <RouterProvider
        initialUrl={event.request.url}
        initialPagePath={page.pagePath}
      >
        <AppProvider
          Component={Component}
          App={EnhancedApp}
          pageProps={props}
          context={context}
        />
      </RouterProvider>
    );

    return { html };
  };

  const docProps = await Document.getEdgeProps({
    page,
    props,
    context,
    event,
    buildManifest,
    renderPage,
  });

  const helmet = Helmet.renderStatic();

  const html = Document.renderDocument(Document, {
    helmet,
    currentPage: getFlattenedCurrentPage(page),
    page,
    props,
    context,
    buildManifest,
    ...docProps,
  });

  return "<!DOCTYPE html>" + ReactDOMServer.renderToString(html);
}

function getFlattenedCurrentPage(page) {
  let currentPage = page.page
    .replace(/^\./, "")
    .replace(/\.(js|css|jsx|ts|tsx)$/, "");

  // Flatten dynamic `index.js` pages
  if (currentPage !== "/index" && currentPage.endsWith("/index")) {
    currentPage = currentPage.replace(/\/index$/, "");
  }

  return currentPage;
}
