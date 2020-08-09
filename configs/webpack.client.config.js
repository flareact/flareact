const baseConfig = require("./webpack.config");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { flareactConfig } = require("./utils");
const defaultLoaders = require("./loaders");
const webpack = require("webpack");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const projectDir = process.cwd();
const flareact = flareactConfig(projectDir);
const dev = process.env.NODE_ENV === "development";
const isServer = false;

module.exports = (env, argv) => {
  const config = {
    ...baseConfig({ dev, isServer }),
    optimization: {
      minimizer: [new TerserJSPlugin(), new OptimizeCSSAssetsPlugin()],
    },
    context: projectDir,
    target: "web",
    entry: "flareact/src/client/index.js",
    output: {
      filename: "client.js",
      path: path.resolve(projectDir, "out"),
    },
    plugins: [new MiniCssExtractPlugin()],
    devServer: {
      contentBase: path.resolve(projectDir, "out"),
      hot: true,
      hotOnly: true,
      stats: "errors-warnings",
      noInfo: true,
      headers: {
        "access-control-allow-origin": "*",
      },
    },
    devtool: "source-map",
  };

  if (dev) {
    config.plugins.push(new ReactRefreshWebpackPlugin());

    config.output.publicPath = "http://localhost:8080/";
  }

  if (flareact.webpack) {
    return flareact.webpack(config, {
      dev,
      isServer,
      isWorker: isServer,
      defaultLoaders: defaultLoaders({ dev, isServer }),
      webpack,
    });
  }

  return config;
};
