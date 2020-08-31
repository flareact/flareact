import { useRouter } from "../router";

export default function AppProvider({
  Component: initialComponent,
  pageProps,
  App,
}) {
  const { component } = useRouter();
  const Component = component.Component || initialComponent;
  const props = component.pageProps || pageProps;

  if (!Component) {
    return null;
  }

  return <App Component={Component} pageProps={props} />;
}
