import React from "react";
import { RouterProvider } from "../../router";
import AppProvider from "../../components/AppProvider";

export default function Container({ Component, App, pageProps }) {
  return (
    <RouterProvider
      initialUrl={window.location.toString()}
      initialComponent={Component}
    >
      <AppProvider Component={Component} App={App} pageProps={pageProps} />
    </RouterProvider>
  );
}
