import React from "react";
import ReactDOM from "react-dom";
import PageLoader from "./page-loader";
import { RouterProvider } from "../router";
import AppProvider from "../components/AppProvider";

const initialData = JSON.parse(
  document.getElementById("__FLAREACT_DATA").textContent
);

window.__FLAREACT_DATA = initialData;

const pagePath = initialData.page.pagePath;
const pageLoader = new PageLoader(pagePath);

const register = (page) => pageLoader.registerPage(page);

if (window.__FLAREACT_PAGES) {
  window.__FLAREACT_PAGES.forEach((p) => register(p));
}

window.__FLAREACT_PAGES = [];
window.__FLAREACT_PAGES.push = register;

async function render() {
  const App = await pageLoader.loadPage("/_app");
  const Component = await pageLoader.loadPage(pagePath);

  ReactDOM.hydrate(
    <RouterProvider
      initialUrl={window.location.toString()}
      initialPagePath={pagePath}
      initialComponent={Component}
      pageLoader={pageLoader}
    >
      <AppProvider
        Component={Component}
        App={App}
        pageProps={initialData.props}
      />
    </RouterProvider>,
    document.getElementById("__flareact")
  );
}

render();
