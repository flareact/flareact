# Pages

In Flareact, a **page** is a React Component exported from a `.js` file in the `pages` directory. Each page is associated with a route based on its filename.

**Example**: If you create `pages/about.js` that exports a React component like this, it will be accessible at `/about`:

```js
export default function About() {
  return <h1>About</h1>;
}
```

## Dynamic Routes

Flareact supports pages with dynamic routes.

**Example**: If you create `pages/posts/[slug].js`, then it will be accessible at `posts/my-first-post`, `posts/another-update`, etc.

[Learn more about Dynamic Routes](/docs/dynamic-routes)
