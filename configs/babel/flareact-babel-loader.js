module.exports = require("babel-loader").custom((babel) => {
  return {
    customOptions({ dev, isServer, ...loader }) {
      return {
        custom: { dev, isServer },
        loader,
      };
    },

    config(cfg, { customOptions: { isServer, dev } }) {
      const filename = this.resourcePath;
      const isPageFile = filename.includes("pages");

      let plugins = [
        "styled-jsx/babel",
        "react-require",
        "@babel/plugin-transform-runtime",
      ];

      if (!isServer) {
        if (dev) {
          plugins.push(require.resolve("react-refresh/babel"));
        }

        if (isPageFile) {
          plugins.push(require.resolve("./plugins/flareact-edge-transform"));
        }
      }

      return {
        ...cfg.options,
        presets: [
          "@babel/preset-env",
          "@babel/preset-react",
          "@babel/preset-typescript",
          ...(cfg.options.presets || []),
        ],
        plugins: [...plugins, ...(cfg.options.plugins || [])],
      };
    },
  };
});
