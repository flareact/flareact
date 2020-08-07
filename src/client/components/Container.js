import React from "react";
import { RouterProvider } from "../../router";
import AppProvider from "../../components/AppProvider";

export default function Container({ Component, pageProps, context }) {
  return (
    <RouterProvider
      initialUrl={window.location.toString()}
      initialComponent={Component}
      context={context}
    >
      <AppProvider
        Component={Component}
        pageProps={pageProps}
        context={context}
      />
    </RouterProvider>
  );
}
