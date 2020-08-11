import { useRouter } from "../router";
import { getPage } from "../worker/pages";

export default function AppProvider({
  Component: initialComponent,
  pageProps,
  context,
}) {
  const { component } = useRouter();
  const Component = component.Component || initialComponent;
  const props = component.pageProps || pageProps;

  if (!Component) {
    return null;
  }

  const App = getPage("/_app", context).default;

  return <App Component={Component} pageProps={props} />;
}
