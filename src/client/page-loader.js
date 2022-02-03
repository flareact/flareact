import mitt from "mitt";

const dev = process.env.NODE_ENV !== "production";

export default class PageLoader {
  constructor(initialPage) {
    this.pageCache = {};

    // These two pages are always loaded at first.
    this.loadingRoutes = {
      "/_app": true,
      [initialPage]: true,
    };

    this.pageRegisterEvents = mitt();

    this.promisedBuildManifest = new Promise((resolve) => {
      if (window.__BUILD_MANIFEST) {
        resolve(window.__BUILD_MANIFEST);
      } else {
        window.__BUILD_MANIFEST_CB = () => resolve(window.__BUILD_MANIFEST);
      }
    });
  }

  async registerPage(route) {
    const [pageName, fn] = route;
    const pagePath = pageName.replace(/^pages/, "");

    try {
      const mod = fn();
      const component = mod.default || mod;

      this.pageCache[pagePath] = component;
      this.pageRegisterEvents.emit(pagePath, component);
    } catch (e) {
      console.error(`Error loading page: ${pagePath}`, e);
    }
  }

  loadPage(route) {
    return new Promise((resolve) => {
      if (this.pageCache[route]) {
        return resolve(this.pageCache[route]);
      }

      const load = (page) => {
        this.pageRegisterEvents.off(route, load);
        delete this.loadingRoutes[route];
        resolve(page);
      };

      this.pageRegisterEvents.on(route, load);

      if (!this.loadingRoutes[route]) {
        this.loadingRoutes[route] = true;

        if (dev) {
          const url = getPagePathUrl(route);
          this.loadScript(url);
          return;
        }

        this.getDependencies(route).then((deps) => {
          deps.forEach((dep) => {
            const url = getDependencyUrl(dep);

            if (url.endsWith(".js")) {
              this.loadScript(url);
            } else {
              this.loadStylesheet(url);
            }
          });
        });
      }
    });
  }

  async loadPageProps(pagePath) {
    const url = getPagePropsUrl(pagePath);
    const res = await fetch(url);

    return await res.json();
  }

  prefetchData(route) {
    const url = getPagePropsUrl(route);

    this.loadPrefetch(url, "script");
  }

  async prefetch(route) {
    if (connectionIsSlow()) return;

    if (dev) {
      const url = getPagePathUrl(route);
      this.loadPrefetch(url, "script");
      return;
    }

    const deps = await this.getDependencies(route);
    deps.forEach((dep) => {
      const url = getDependencyUrl(dep);

      const as = url.endsWith(".js") ? "script" : "fetch";
      this.loadPrefetch(url, as);
    });
  }

  async getDependencies(route) {
    const deps = await this.promisedBuildManifest;

    return deps[route];
  }

  loadScript(path) {
    const prefix =
      process.env.NODE_ENV === "production" ? "" : "http://localhost:8080";
    const url = prefix + path;

    if (document.querySelector(`script[src^="${url}"]`)) return;

    const script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);
  }

  loadPrefetch(path, as) {
    return new Promise((resolve, reject) => {
      if (
        document.querySelector(`link[rel="${relPrefetch}"][href^="${path}"]`)
      ) {
        return resolve();
      }

      const link = document.createElement("link");
      link.as = as;
      link.rel = relPrefetch;
      link.onload = resolve;
      link.onerror = reject;
      link.href = path;

      document.head.appendChild(link);
    });
  }

  loadStylesheet(path) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[rel="stylesheet"][href^="${path}"]`)) {
        return resolve();
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.onload = resolve;
      link.onerror = reject;
      link.href = path;

      document.head.appendChild(link);
    });
  }
}

export function getPagePropsUrl(pagePath) {
  const [basePath, search] = pagePath.split("?");
  return `/_flareact/props${basePath}.json${search ? "?" + search : ""}`;
}

// Used in development only
function getPagePathUrl(pagePath) {
  const prefix = dev ? "/pages" : "/_flareact/static/pages";

  return prefix + pagePath + ".js";
}

function getDependencyUrl(path) {
  const prefix = dev ? "/" : "/_flareact/static/";

  return prefix + path;
}

/**
 * Borrowed from Next.js
 */
function hasRel(rel, link) {
  try {
    link = document.createElement("link");
    return link.relList.supports(rel);
  } catch {}
}

/**
 * Borrowed from Next.js
 */
const relPrefetch =
  hasRel("preload") && !hasRel("prefetch")
    ? // https://caniuse.com/#feat=link-rel-preload
      // macOS and iOS (Safari does not support prefetch)
      "preload"
    : // https://caniuse.com/#feat=link-rel-prefetch
      // IE 11, Edge 12+, nearly all evergreen
      "prefetch";

/**
 * Borrowed from Next.js.
 * Don't prefetch if using 2G or if Save-Data is enabled.
 *
 * https://github.com/GoogleChromeLabs/quicklink/blob/453a661fa1fa940e2d2e044452398e38c67a98fb/src/index.mjs#L115-L118
 * License: Apache 2.0
 */
function connectionIsSlow() {
  let cn;
  if ((cn = navigator.connection)) {
    return cn.saveData || /2g/.test(cn.effectiveType);
  }

  return false;
}
