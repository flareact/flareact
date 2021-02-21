# Static File Serving

When you add files to a `/public` folder in your project, Flareact will serve those assets at your site root path.

For example, if you add `public/favicon.ico` locally, it will be served at `site.com/favicon.ico`.

Behind the scenes, Cloudflare stores these assets in the [Workers KV](https://www.cloudflare.com/products/workers-kv/) and serves them directly on the edge.

## Adding a custom 404 Not Found error page

By adding a `/public/404.html` HTML document, you can customize the 404 Not Found error page. See [Custom 404 Not Found Error Page](/docs/custom-404-error-page).
