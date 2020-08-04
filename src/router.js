import { useContext, useState, useEffect } from "react";
import { getPage } from "./worker";

const RouterContext = React.createContext();

async function loadPageProps(pagePath) {
  const res = await fetch(`/_flareact${pagePath}.json`);
  return await res.json();
}

export function RouterProvider({ children, initialUrl, initialComponent }) {
  const { pathname: initialPathname } = new URL(initialUrl);
  const [pathname, setPathname] = useState(initialPathname);
  const [component, setComponent] = useState({
    Component: initialComponent,
    pageProps: null,
  });

  useEffect(() => {
    async function loadNewPage() {
      const pagePath = pathname === "/" ? "/index" : pathname;

      const page = await getPage(pagePath);
      const { pageProps } = await loadPageProps(pagePath);

      setComponent({
        Component: page.default,
        pageProps,
      });
    }

    loadNewPage();
  }, [pathname]);

  function push(newPathname) {
    setPathname(newPathname);

    window.history.pushState({ pathname: newPathname }, null, newPathname);
  }

  useEffect(() => {
    function handlePopState(e) {
      const { pathname: newPathname } = e.state;

      setPathname(newPathname);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setPathname]);

  const router = {
    component,
    pathname,
    push,
  };

  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
