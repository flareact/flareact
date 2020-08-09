const baseConfig = require("./webpack.config");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { flareactConfig } = require("./utils");
const defaultLoaders = require("./loaders");

const dev = !!process.env.WORKER_DEV;
const isServer = true;
const projectDir = process.cwd();
const flareact = flareactConfig(projectDir);

module.exports = function (env, argv) {
  let config = {
    ...baseConfig({ dev, isServer }),
    target: "webworker",
    entry: path.resolve(projectDir, "./index.js"),
  };

  config.plugins.push(
    new CopyPlugin([
      {
        from: path.resolve(projectDir, "public"),
        to: path.resolve(projectDir, "out"),
      },
    ])
  );

  if (dev) {
    config.plugins.push(
      new webpack.DefinePlugin({
        DEV: dev,
      })
    );
  }

  if (flareact.webpack) {
    config = flareact.webpack(config, {
      dev,
      isServer,
      isWorker: isServer,
      defaultLoaders: defaultLoaders({ dev, isServer }),
      webpack,
    });
  }

  return config;
};
