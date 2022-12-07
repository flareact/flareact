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