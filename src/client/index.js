import React from "react";
import ReactDOM from "react-dom";
import Container from "./components/Container";
import { registerInitialPages, getClientPage } from "../worker/pages";

const initialData = JSON.parse(
  document.getElementById("initial-data").getAttribute("data-json")
);

// if (module.hot) {
//   module.hot.accept(context.id, function () {
//     context = require.context("../../../../pages/", true, /\.js$/);
//     render(Math.random());
//   });
// }

async function render(key) {
  await registerInitialPages();

  // TODO: Find smarter way to ensure initial pages have loaded
  await new Promise((resolve) => setTimeout(resolve, 100));

  const { page } = initialData;
  // TODO: Simplify page path parsing
  const pagePath = page.page.replace(/^\./, "").replace(/\.js$/, "");
  const component = getClientPage(pagePath);
  const App = getClientPage("/_app");

  ReactDOM.hydrate(
    <Container
      pageProps={initialData.props}
      Component={component}
      App={App}
      key={key}
    />,
    document.getElementById("__flareact")
  );
}

render();
