import { RouterProvider } from "../../router";
import App from "../../components/_app";

export default function Container({ Component, pageProps }) {
  return (
    <RouterProvider
      initialUrl={window.location.toString()}
      initialComponent={Component}
    >
      <App pageProps={pageProps} />
    </RouterProvider>
  );
}
