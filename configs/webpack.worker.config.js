const { baseConfig } = require("./webpack");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  ...baseConfig,
  target: "webworker",
  entry: path.resolve(process.cwd(), "./index.js"),
  plugins: [
    new CopyPlugin([
      {
        from: path.resolve(process.cwd(), "public"),
        to: path.resolve(process.cwd(), "out"),
      },
    ]),
  ],
};
