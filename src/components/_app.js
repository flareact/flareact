import React from "react";
import { useRouter } from "../router";

export default function App({ Component: initialComponent, pageProps }) {
  const { component } = useRouter();
  const Component = component?.Component || initialComponent;
  const props = component?.pageProps || pageProps;

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
}
