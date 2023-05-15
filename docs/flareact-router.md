# flareact/router

Flareact provides access to the `router` instance using the `useRouter()` hook:

```js
import { useRouter } from "flareact/router";

export default function Index() {
  const router = useRouter();

  // Inspect the pathname
  router.pathname;

  // Inspect the asPath
  router.asPath;

  // Inspect the query and params
  router.query;

  // Listen to events happening inside the router
  router.events;

  // Navigate to the /about page
  router.push("/about");

  // Navigate to the dynamic route /posts/[slug] using `href`, `as`
  router.push("/posts/[slug]", "/posts/my-first-post");

  // Navigate to a route using config object
  router.push("/", "/?page=2", { shallow: true, scroll: false })

  // Navigate back in history
  router.back();

  // Reload the current URL
  router.reload();
}
```

## router.push(href, as, options)

* `href` -  URL path to navigate to
* `as` - Optional specific URL to be displayed in the address bar, e.g. for dynamic routes or query strings
* `options` - Optional config object:
    * `shallow` - Optional. Update current page path without rerunning `getEdgeProps`. Default = `false`
    * `scroll` - Optional. Controls whether to scroll to the top of the page after navigation. Default = `true`

## router.events
The following events are triggered from inside the router.
* `routeChangeStart({ asPath, shallow })` - Fires when route change has started.
* `routeChangeComplete({ asPath, shallow })` - Fires when a route change has completed.
* `beforeHistoryChange({ asPath, shallow })` - Fires before a history update is performed.

An example of listening to the route change start and complete events in `pages/_app.js` would be:

```js
  import React, { useEffect } from "react";
  import { useRouter } from "flareact/router";

  export default function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
      const handleRouteChangeStart = ({ asPath, shallow }) => {
        console.log("Route change was started.", asPath, shallow);
      }

      const handleRouteChangeComplete = ({ asPath, shallow }) => {
        console.log("Route change was completed.", asPath, shallow);
      }

      router.events.on('routeChangeStart', handleRouteChangeStart);
      router.events.on('routeChangeComplete', handleRouteChangeComplete);

      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart);
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
      }
    }, [])

    return <Component {...pageProps} />;
  }
```