const { baseConfig } = require("./webpack");
const path = require("path");

module.exports = {
  ...baseConfig,
  context: process.cwd(),
  entry: "flareact/src/client/index.js",
  output: {
    filename: "client.js",
    path: path.resolve(process.cwd(), "out"),
  },
  devtool: "source-map",
  resolve: {
    // Only necessary for localdev of flareact
    alias: {
      react: path.resolve(process.cwd(), "./node_modules/react"),
    },
  },
};
