# Custom PostCSS Config

Flareact processes your CSS using PostCSS. By default, Flareact uses the following plugins:

```js
module.exports = {
  plugins: [
    require("postcss-flexbugs-fixes"),
    require("postcss-preset-env")({
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
      features: {
        "custom-properties": false,
      },
    }),
  ],
};
```

If you need to customize the PostCSS plugins for your project, you can define a local `postcss.config.js` file.

**Note**: If you define a custom PostCSS config, it will completely replace the config that Flareact provides - so be sure to include everything you need to process your styles.

Here's an example for using TailwindCSS:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```
