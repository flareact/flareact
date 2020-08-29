import React from "react";
import { RouterProvider } from "../../router";
import AppProvider from "../../components/AppProvider";

export default function Container({
  Component,
  App,
  pageLoader,
  pageProps,
  pagePath,
}) {
  return (
    <RouterProvider
      initialUrl={window.location.toString()}
      initialPagePath={pagePath}
      initialComponent={Component}
      pageLoader={pageLoader}
    >
      <AppProvider Component={Component} App={App} pageProps={pageProps} />
    </RouterProvider>
  );
}
