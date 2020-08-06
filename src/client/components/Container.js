import React from "react";
import { RouterProvider } from "../../router";
import App from "../../components/_app";

export default function Container({ Component, pageProps, context }) {
  return (
    <RouterProvider
      initialUrl={window.location.toString()}
      initialComponent={Component}
      context={context}
    >
      <App pageProps={pageProps} />
    </RouterProvider>
  );
}
