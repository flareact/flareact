import React, { useContext, useState, useEffect, useMemo } from "react";
import {
  convertSearchParamsToQueryObject,
  extractDynamicParams,
} from "./utils";
import { DYNAMIC_PAGE } from "./worker/pages";

const RouterContext = React.createContext();

let pageCache = {};

export function RouterProvider({
  children,
  initialUrl,
  initialPagePath,
  initialComponent,
  pageLoader,
}) {
  const { pathname: initialPathname, search, searchParams } = new URL(
    initialUrl
  );
  const [route, setRoute] = useState({
    href: initialPagePath,
    asPath: initialPathname + search,
  });
  const [initialPath, setInitialPath] = useState(initialPathname);
  const [component, setComponent] = useState({
    Component: initialComponent,
    pageProps: null,
  });

  const params = useMemo(() => {
    const isDynamic = DYNAMIC_PAGE.test(route.href);

    if (!isDynamic) return {};

    return extractDynamicParams(route.href, route.asPath);
  }, [route.asPath, route.href]);

  const query = useMemo(() => {
    return {
      ...convertSearchParamsToQueryObject(searchParams),
      ...params,
    };
  }, [searchParams, params]);

  useEffect(() => {
    async function loadNewPage() {
      const { href, asPath } = route;
      const pagePath = normalizePathname(href);
      const normalizedAsPath = normalizePathname(asPath);

      if (!pageCache[normalizedAsPath]) {
        const page = await pageLoader.loadPage(pagePath);
        const { pageProps } = await pageLoader.loadPageProps(normalizedAsPath);

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

  function prefetch(href, as, { priority } = {}) {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const pagePath = normalizePathname(href);
    const asPath = normalizePathname(as || href);

    return Promise.all([
      pageLoader.prefetchData(asPath),
      pageLoader[priority ? "loadPage" : "prefetch"](pagePath),
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
    query,
  };

  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export function normalizePathname(pathname) {
  return pathname === "/" ? "/index" : pathname;
}
