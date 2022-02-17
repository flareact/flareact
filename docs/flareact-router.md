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

  // Navigate back in history
  router.back();

  // Reload the current URL
  router.reload();
}
```
