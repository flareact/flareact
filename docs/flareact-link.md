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

## Scroll

The default behaviour of the Link component is to scroll to the top of the page.
When there's a hash defined, it will scroll to the specific ID.

This feature is useful for a layered component where each tab needs to update the route.
By default, the scroll would go to the top of the page, but the correct behaviour is to update the route and change the tab's content.

You can disable this behaviour by passing a `false` value to `scroll`:

```js
import Link from "flareact/link";

export default function Index() {
  return (
    <div>
      <Link href="/about" scroll={false}>
        <a>Change route without scrolling top</a>
      </Link>
    </div>
  );
}
```

## Shallow

In some circumstances it may be desirable for the page URL to be updated without rerunning `getEdgeProps`. In this case a `true` value should be passed to `shallow`.

This will only work for routing to the current page, e.g. updating `/posts` to `/posts?page=2` can be shallow routed but `/posts` to `/posts/2` will load the destination props.

```js
import Link from "flareact/link";

export async function getEdgeProps() {
    const props = await someResourceIntensiveFunction();

    return {
        props
    };
}

export default function Index() {
  return (
    <div>
      <Link href="/" as="/?page=2" shallow={true}>
        <a>Change route without rerunning getEdgeProps</a>
      </Link>
    </div>
  );
}
```