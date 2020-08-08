const { baseConfig } = require("./webpack.config");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const DEV = !!process.env.WORKER_DEV;

module.exports = {
  ...baseConfig,
  target: "webworker",
  entry: path.resolve(process.cwd(), "./index.js"),
  plugins: [
    ...baseConfig.plugins,
    new CopyPlugin([
      {
        from: path.resolve(process.cwd(), "public"),
        to: path.resolve(process.cwd(), "out"),
      },
    ]),
    DEV &&
      new webpack.DefinePlugin({
        DEV,
      }),
  ].filter(Boolean),
};
