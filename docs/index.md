# Flareact

Flareact is an **edge-rendered** React framework built for [Cloudflare Workers](https://workers.cloudflare.com/).

It features **file-based page routing** with dynamic page paths and **edge-side data fetching** APIs.

Flareact is modeled after the terrific [Next.js](https://nextjs.org/) project and its APIs. If you're transitioning from Next.js, a lot of the APIs will seem familiar, _if not identical_!

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/flareact/flareact-template)

## Overview

Flareact will serve each file in the `/pages` directory under a pathname matching the filename.

For example, the following component at `/pages/about.js`:

```js
export default function About() {
  return <h1>Who we are</h1>;
}
```

The above page will be served at `site.com/about`.

Next step: Read the [getting started guide](/docs/getting-started).

## But why?

Right — *another* React framework. Here's why Flareact might be useful to you:

- **Server-Side Rendering** (technically _edge-side_ rendering): Return the HTML output of your site in the initial request, rather than waiting for the client to render it. This can be helpful for SEO and initial time-to-first-paint/time-to-interactive.
- **Cloudflare**: If you already point your site's DNS to Cloudflare, you might as well host your site there, too! No need to find additional hosting, wire up DNS records, or deal with SSL provisioning issues between services.
- **Speed**: Because your site is being generated and served directly from the Cloudflare edge network, you're reducing network hops between the CDN and your content host. This means your site is delivered _within milliseconds_. Cloudflare even [eliminates cold starts using the TLS handshake period](https://blog.cloudflare.com/eliminating-cold-starts-with-cloudflare-workers/).
- **Infinitely scalable**: Don't worry about scaling up servers or getting hit with steep service provider fees. Cloudflare's network is built to handle huge amounts of traffic with a predictable pricing model. Plus, by caching your page data at the edge with an optional invalidation strategy, you can host dynamic content as if it were a statically-generated site.
- **Familiar API**: Next.js did the hard work to create a great developer experience (DX) for creating and maintaining modern React applications. Flareact borrows many patterns from Next.js, so you'll feel right at home developing your Flareact site.

## Examples

- [Flareact Docs (this site)](https://github.com/flareact/flareact-site/)
- [Headless CMS: WordPress](https://github.com/flareact/flareact/tree/main/examples/with-cms-wordpress)

## About

Flareact **is not an official Cloudflare project**. Flareact is an experiment created by [Josh Larson](https://www.jplhomer.org/) in August 2020.

Lots of inspiration and thanks to:

- [Next.js](https://nextjs.org) (obviously)
- [SWR](https://swr.vercel.app/) for this site's design inspiration
- [Tailwind](https://tailwindcss.com) for the styles
- [Kari Linder](https://twitter.com/kkblinder) from Cloudflare for the logo 🔥
