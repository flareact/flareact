# flareact/link

To perform client-side routing between different pages of your Flareact app, use the `flareact/link` component:

```js
import Link from "flareact/link";

export default function Index() {
  return (
    <div>
      <Link href="/about">
        <a>Go to About</a>
      </Link>
    </div>
  );
}
```

`<Link>` accepts a single child element. If you provide an `<a>` tag, it will automatically apply the `href` at render time.

## Dynamic Routes

In order to support [dynamic routes](/docs/dynamic-routes), you need to provide an extra parameter `as` to the `<Link>` component.

In the following example, we want to link to `/posts/my-first-post`, which represents a dynamic page route at `/pages/posts/[slug].js`:

```js
import Link from "flareact/link";

export default function Index() {
  return (
    <Link href="/posts/[slug]" as="/posts/my-first-post">
      <a>My First Post</a>
    </Link>
  );
}
```

## Prefetch

By default, Flareact will detect usage of `<Link>` in your page and:

- Prefetch the page and props if the link is in viewport (using `IntersectionObserver`)
- Preload the page bundle on hover

This happens **only in production**. You can disable this behavior by passing a `false` value to `prefetch`:

```js
import Link from "flareact/link";

export default function Index() {
  return (
    <div>
      <Link href="/about" prefetch={false}>
        <a>Go to About</a>
      </Link>
    </div>
  );
}
```
