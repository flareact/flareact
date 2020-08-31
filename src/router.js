import React, { useContext, useState, useEffect } from "react";
import { getPagePropsUrl } from "./client/page-loader";

const RouterContext = React.createContext();

let pageCache = {};

export function RouterProvider({
  children,
  initialUrl,
  initialPagePath,
  initialComponent,
  pageLoader,
}) {
  const { pathname: initialPathname } = new URL(initialUrl);
  const [route, setRoute] = useState({
    href: initialPagePath,
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
      const pagePath = normalizePathname(href);
      const normalizedAsPath = normalizePathname(asPath);

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

    window.history.pushState({ href, asPath }, null, asPath);
  }

  function prefetch(href, as) {
    const pagePath = normalizePathname(href);
    const asPath = normalizePathname(as || href);

    if (process.env.NODE_ENV !== "production") {
      return;
    }

    return Promise.all([
      pageLoader.prefetchData(asPath),
      // TODO: Support `prefetch` in addition to `loadPage`
      pageLoader.loadPage(pagePath),
    ]);
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
    prefetch,
  };

  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

async function loadPageProps(pagePath) {
  const url = getPagePropsUrl(pagePath);
  const res = await fetch(url);
  return await res.json();
}

export function normalizePathname(pathname) {
  return pathname === "/" ? "/index" : pathname;
}
