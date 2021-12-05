# Dynamic Routes

Often times, your app pages will need to be created dynamically.

Similar to page-based routes, Flareact allows you to define **dynamic routes** using React components defined in files.

To define a dynamic route, create a file with a name wrapped by square brackets `[]`, e.g. `/pages/[slug].js`.

## Dynamic Routes with `getEdgeProps`

If you need to [fetch data](/docs/data-fetching) for your dynamic page component, the dynamic parts will be passed as a `params` property to your `getEdgeProps` function.

**Example**: Your `/pages/posts/[slug].js` file might look like this:

```js
export async function getEdgeProps({ params }) {
  const { slug } = params;
  const post = await getSomeRemotePost({ slug });

  return {
    props: {
      post
    }
  }
}

export default function Post({ post }) {
  ...
}
```

## Nested Dynamic Routes

You can also nest dynamic routes, e.g.

```
/pages/posts/[category]/[slug].js
```

The params passed to your `getEdgeProps` function will contain each dynamic path property:

```js
{
  params: {
    category,
    slug,
  }
}
```

## Catch all routes

Dynamic routes can be extended to catch all paths by adding three dots `(...)` inside the brackets. For example:

```
/pages/posts/[...slug].js
```

`/pages/post/[...slug].js` matches `/pages/post/a`, but also `/pages/post/a/b`, `/pages/post/a/b/c` and so on.


The params passed to your `getEdgeProps` function will contain a dynamic path property with an array of the passed parameters:

```
{ "slug": ["a", "b"] }
```

You can also reference the query params with the `useRouter` hook in your component:

```js
function Post() {
  const router = useRouter();

  const { category, slug } = router.query;
}
```

## Resources

- [Linking to Dynamic Routes](/docs/flareact-link#dynamic-routes)
