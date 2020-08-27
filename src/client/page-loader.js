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
  }

  async registerPage(route) {
    const [pageName, fn] = route;
    const pagePath = pageName.replace(/^pages/, "");

    try {
      const mod = fn();
      const component = mod.default || mod;

      this.pageCache[pagePath] = component;
      this.pageRegisterEvents.emit(pagePath, component);
      console.log(`registered ${pagePath}`);
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

        const prefix = dev ? "pages" : "flareact/static/pages";

        this.loadScript(prefix + encodeURIComponent(route) + `.js`);
      }
    });
  }

  loadScript(path) {
    const prefix =
      process.env.NODE_ENV === "production" ? "/" : "http://localhost:8080/";
    const url = prefix + path;

    if (document.querySelector(`script[src^="${url}"]`)) return;

    const script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);
  }
}
