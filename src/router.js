import React, { useContext, useEffect, useMemo, useState } from "react";

import { DYNAMIC_PAGE } from "./worker/pages";
import { extractDynamicParams } from "./utils";

const RouterContext = React.createContext();

let pageCache = {};

export function RouterProvider({
  children,
  initialUrl,
  initialPagePath,
  initialComponent,
  pageLoader,
}) {
  const { protocol, host, pathname: initialPathname, search } = new URL(
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
    const url = new URL(protocol + "//" + host + route.asPath);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    return {
      ...queryParams,
      ...params,
    };
  }, [protocol, host, route.asPath, params]);

  useEffect(() => {
    // On initial page load, replace history state with format expected by router
    window.history.replaceState(route, null, route.asPath);
  }, [])

  useEffect(() => {
    async function loadNewPage() {
      const { href, asPath, scroll } = route;
      const pagePath = normalizePathname(href);
      const normalizedAsPath = normalizePathname(asPath);

      if ( !pageCache[normalizedAsPath] || hasPagePropsExpired(pageCache[normalizedAsPath].expiry)) {
        const page = await pageLoader.loadPage(pagePath);
        const { pageProps } = await pageLoader.loadPageProps(normalizedAsPath);

        if (pageProps.redirect && pageProps.redirect.destination) {
          if (pageProps.redirect.destination.startsWith("/")) {
            router.push(pageProps.redirect.destination, pageProps.redirect.as);
          } else {
            window.location.href = pageProps.redirect.as;
          }

          return;
        }
        
        const revalidateSeconds = getRevalidateValue(pageProps);
        const expiry = generatePagePropsExpiry(revalidateSeconds);

        pageCache[normalizedAsPath] = {
          expiry: expiry,
          Component: page,
          pageProps,
        };
      }

      setComponent(pageCache[normalizedAsPath]);
      if (scroll) {
        setTimeout(() => scrollToHash(asPath), 0);
      }
    }

    if (initialPath === route.asPath) {
      return;
    }

    loadNewPage();
  }, [route, initialPath]);

  function generatePagePropsExpiry(seconds) {
    if (seconds === null) {
      return null;
    }

    return Date.now() + (seconds * 1000);
  }

  function hasPagePropsExpired(expiry) {
    if (expiry === null) {
      return false;
    }

    if (Date.now() < expiry) {
      return false;
    }

    return true;
  }

  function getRevalidateValue(pageProps) {
    if (pageProps.revalidate == null) {
      return null;
    }

    return pageProps.revalidate;
  }

  function push(href, as, scroll) {
    const asPath = as || href;

    setRoute({
      href,
      asPath,
      scroll
    });

    // Blank this out so any return trips to the original component re-fetches props.
    setInitialPath("");

    window.history.pushState({ href, asPath }, null, asPath);
  }

  // Navigate back in history
  function back() {
    window.history.back()
  }

  // Reload the current URL
  function reload() {
    window.location.reload()
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
        const { pathname, search, hash } = window.location;

        newRoute = {
          href: pathname || "/",
          asPath: pathname + search + hash || "/",
        };
      }

      setRoute(newRoute);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [setRoute]);

  function scrollToHash(asPath) {
    const [, hash] = asPath.split("#");

    // If no hash set, scroll to top of page
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const idEl = document.getElementById(hash);
    if (idEl) {
      idEl.scrollIntoView();
      return;
    }

    const nameEl = document.getElementsByName(hash)[0];
    if (nameEl) {
      nameEl.scrollIntoView();
    }
  }

  const router = {
    component,
    pathname: route.href,
    asPath: route.asPath,
    push,
    back,
    reload,
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