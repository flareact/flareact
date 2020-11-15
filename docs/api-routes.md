# API Routes

Flareact provides a way for you to build your **API** using the existing file-based routing system.

Any file inside the folder `pages/api` is mapped to `/api/*` and will be treated as an API endpoint instead of a `page`.

For example, the following API route `pages/api/hello.js` returns a standard text response:

```js
export default async (event) => {
  return new Response("Hello there");
};
```

For an API route to work, you need to export a default function (a **request handler**) which receives a [`FetchEvent` parameter](https://developers.cloudflare.com/workers/reference/apis/fetch-event).

Your API method may return a new instance of [`Response`](https://developers.cloudflare.com/workers/reference/apis/response/). This allows you to customize headers, formatting, and status code.

However, Flareact will conveniently wrap your API method's response in a `Response` object if you return only a primitive:

```js
export default async (event) => {
  return { hello: "world" };
};

// becomes:
// new Response(JSON.stringify({ hello: 'world' }), { headers: { 'content-type': 'application/json' }})

export default async (event) => {
  return "Hello, world";
};

// becomes:
// new Response('Hello, world')
```

API routes handle requests exactly like [standard Cloudflare Worker requests](https://developers.cloudflare.com/workers/about/how-it-works/), except that you **do not need to call `event.respondWith`**.

**Note**: You can use `fetch` natively within `getEdgeProps` without needing to require any polyfills, because it is a first-class WebWorker API supported by Workers.
