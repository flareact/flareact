const { baseConfig } = require("./webpack");
const path = require("path");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const config = {
  ...baseConfig,
  context: process.cwd(),
  entry: "flareact/src/client/index.js",
  output: {
    filename: "client.js",
    path: path.resolve(process.cwd(), "out"),
  },
  devServer: {
    contentBase: path.resolve(process.cwd(), "out"),
    hot: true,
    hotOnly: true,
    headers: {
      "access-control-allow-origin": "*",
    },
  },
  devtool: "source-map",
  resolve: {
    // Only necessary for localdev of flareact
    alias: {
      react: path.resolve(process.cwd(), "./node_modules/react"),
    },
  },
};

module.exports = (env, argv) => {
  if (argv.mode === "development") {
    config.plugins = [new ReactRefreshWebpackPlugin()];

    // TODO: Find better way to modify babel plugins
    config.module.rules[0].use.options.plugins.push(
      require.resolve("react-refresh/babel")
    );

    config.output.publicPath = "http://localhost:8080/";
  }

  return config;
};
