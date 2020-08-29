import React from "react";
import ReactDOM from "react-dom";
import Container from "./components/Container";
import PageLoader from "./page-loader";

const initialData = JSON.parse(
  document.getElementById("initial-data").getAttribute("data-json")
);

const pagePath = initialData.page.pagePath;
const pageLoader = new PageLoader(pagePath);

const register = (page) => pageLoader.registerPage(page);

if (window.__FLAREACT_PAGES) {
  window.__FLAREACT_PAGES.forEach((p) => register(p));
}

window.__FLAREACT_PAGES = [];
window.__FLAREACT_PAGES.push = register;

async function render(key) {
  const App = await pageLoader.loadPage("/_app");
  const Component = await pageLoader.loadPage(pagePath);

  ReactDOM.hydrate(
    <Container
      pageProps={initialData.props}
      Component={Component}
      App={App}
      key={key}
      pageLoader={pageLoader}
      pagePath={pagePath}
    />,
    document.getElementById("__flareact")
  );
}

render();
