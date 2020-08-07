import React, { useContext, useState, useEffect } from "react";
import { getPage } from "./worker/pages";

const RouterContext = React.createContext();

async function loadPageProps(pagePath) {
  const res = await fetch(`/_flareact${pagePath}.json`);
  return await res.json();
}

let pageCache = {};

export function RouterProvider({
  children,
  initialUrl,
  initialComponent,
  context,
}) {
  const { pathname: initialPathname } = new URL(initialUrl);
  const [pathname, setPathname] = useState(initialPathname);
  const [component, setComponent] = useState({
    Component: initialComponent,
    pageProps: null,
  });

  useEffect(() => {
    async function loadNewPage() {
      const pagePath = pathname === "/" ? "/index" : pathname;

      if (!pageCache[pagePath]) {
        const page = await getPage(pagePath, context);
        const { pageProps } = await loadPageProps(pagePath);

        pageCache[pagePath] = {
          Component: page.default,
          pageProps,
        };
      }

      setComponent(pageCache[pagePath]);
    }

    loadNewPage();
  }, [pathname]);

  function push(newPathname) {
    setPathname(newPathname);

    window.history.pushState({ pathname: newPathname }, null, newPathname);
  }

  useEffect(() => {
    function handlePopState(e) {
      const newPathname = e.state ? e.state.pathname : window.location.pathname;

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
