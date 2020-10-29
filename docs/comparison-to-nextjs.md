# Comparison to Next.js

Flareact is modeled closely after [Next.js](https://nextjs.org). Here are a few key differences:

- Next.js emphasizes static generation, while Flareact leverages edge-computing + caching.
- Next.js has lots of optimizations built in, and it's considered more "production ready"
- Lots of other things 😊

## Rendering Modes

Next.js offers three distinct ways to render your pages:

- **Static-Site Generation (SSG)**: Your pages are generated at deploy time with `getStaticProps`. They are optionally revalidated on a timed basis to support **incremental re-generation** of your pages (useful for e.g. pulling in your latest blog posts).
- **Server-Side Rendering (SSR)**: Your pages are generated on-demand with each request with `getServerProps`. This is less common, given the powerful tool of incremental SSG above.
- **Client-Side Rendering (CSR)**: If you don't need to have your data fetched as part of your initial HTML payload, you can fetch it within your component as a typical AJAX request.

Flareact offers a similar approach with **Edge-Side Rendering (ESR)**:

- Your pages are generated with `getEdgeProps` and cached using the [Cloudflare Worker Cache](https://developers.cloudflare.com/workers/reference/apis/cache/) by default at the edge, similar to **SSG**.
- Optionally, your pages can be revalidated after a specified time, similar to **incremental SSG**.
- If want, pages can also be revalidated on every single request, similar to **SSR**.
- **Client-Side Rendering (CSR)**: If you don't need to have your data fetched as part of your initial HTML payload, you can fetch it within your component as a typical AJAX request.

[Learn more about data fetching in Flareact](/docs/data-fetching)
