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
