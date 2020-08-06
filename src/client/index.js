import React from "react";
import ReactDOM from "react-dom";
import Container from "./components/Container";
import { getPage } from "../worker/pages";

const initialData = JSON.parse(
  document.getElementById("initial-data").getAttribute("data-json")
);

// 😩
let context = require.context("../../../../pages/", true, /\.js$/);

if (module.hot) {
  module.hot.accept(context.id, function () {
    context = require.context("../../../../pages/", true, /\.js$/);
    render();
  });
}

async function render() {
  // TODO: Find a smarter way to load this for initial page view, like with script tag
  const { pathname } = window.location;
  const pagePath = pathname === "/" ? "/index" : pathname;
  const page = await getPage(pagePath, context);

  ReactDOM.hydrate(
    <Container
      pageProps={initialData}
      Component={page.default}
      context={context}
    />,
    document.getElementById("__flareact")
  );
}

render();
