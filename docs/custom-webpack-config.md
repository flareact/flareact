# Custom Webpack Config

Flareact allows you to customize the Webpack config for your worker and client builds.

To modify the Webpack config, define a `flareact.config.js` file in the root of your project:

```js
module.exports = {
  webpack: (config, { dev, isWorker, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));

    // Important: return the modified config
    return config;
  },
};
```

The `webpack` function is executed twice, once for the worker and once for the client. This allows you to distinguish between client and server configuration using the `isWorker` property.

The second argument to the `webpack` function is an object with the following properties:

- `dev`: Boolean - Indicates if the compilation will be done in development
- `isWorker`: Boolean - It's true for worker-side compilation, and false for client-side compilation
- `defaultLoaders`: Object - Default loaders used internally by Flareact:
  - `babel`: Object - Default babel-loader configuration

Example usage of `defaultLoaders.babel`:

```js
module.exports = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.mdx/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: "@mdx-js/loader",
          options: {},
        },
      ],
    });

    return config;
  },
};
```

## Redirects

With redirect you can redirect an incoming request path to a different destination path.

Example usage of `redirects`:

```js
module.exports = {
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
    ]
  },
};
```
It expects an array to be returned holding objects with source, destination, and permanent properties:

- `source` is the incoming request path pattern.
- `destination` is the location you want to route to. This can either be a path or a full url.
- `permanent` if the redirect is permanent or not.

URL parameters provided in the source request can be transferred to the redirect like so:

```js
module.exports = {
  async redirects() {
    return [
      {
        source: '/blog/[slug]',
        destination: '/news/[slug]',
        permanent: true,
      },
    ]
  },
};
```

Note that if redirects for a page are defined in both the edge props and the custom webpack config then the latter will be given priority.