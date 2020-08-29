import React, { useContext, useState, useEffect } from "react";

const RouterContext = React.createContext();

let pageCache = {};

export function RouterProvider({
  children,
  initialUrl,
  initialComponent,
  pageLoader,
}) {
  const { pathname: initialPathname } = new URL(initialUrl);
  const [route, setRoute] = useState({
    href: "",
    asPath: initialPathname,
  });
  const [initialPath, setInitialPath] = useState(initialPathname);
  const [component, setComponent] = useState({
    Component: initialComponent,
    pageProps: null,
  });

  useEffect(() => {
    async function loadNewPage() {
      const { href, asPath } = route;
      const pagePath = href === "/" ? "/index" : href;
      const normalizedAsPath = asPath === "/" ? "/index" : asPath;

      if (!pageCache[normalizedAsPath]) {
        const page = await pageLoader.loadPage(pagePath);
        const { pageProps } = await loadPageProps(normalizedAsPath);

        pageCache[normalizedAsPath] = {
          Component: page,
          pageProps,
        };
      }

      setComponent(pageCache[normalizedAsPath]);
    }

    if (initialPath === route.asPath) {
      return;
    }

    loadNewPage();
  }, [route, initialPath]);

  function push(href, as) {
    const asPath = as || href;

    setRoute({
      href,
      asPath,
    });

    // Blank this out so any return trips to the original component re-fetches props.
    setInitialPath("");

    window.history.pushState({ href, asPath }, null, as);
  }

  useEffect(() => {
    function handlePopState(e) {
      let newRoute = {};

      const { state } = e;

      if (state) {
        newRoute = {
          href: state.href,
          asPath: state.asPath,
        };
      } else {
        newRoute = {
          href: window.location.pathname || "/",
          asPath: window.location.pathname || "/",
        };
      }

      setRoute(newRoute);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setRoute]);

  const router = {
    component,
    pathname: route.href,
    asPath: route.asPath,
    push,
  };

  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

async function loadPageProps(pagePath) {
  const res = await fetch(`/_flareact/props${pagePath}.json`);
  return await res.json();
}
