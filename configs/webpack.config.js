const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const DEV = !!process.env.WORKER_DEV || process.env.NODE_ENV === "development";

function fileExistsInCwd(file) {
  return fs.existsSync(path.join(process.cwd(), file));
}

module.exports = {
  baseConfig: {
    context: process.cwd(),
    plugins: [new MiniCssExtractPlugin()],
    stats: "errors-warnings",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(flareact)\/).*/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: ["react-require", "@babel/plugin-transform-runtime"],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            DEV
              ? "style-loader"
              : {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    hmr: process.env.NODE_ENV === "development",
                  },
                },
            { loader: "css-loader", options: { importLoaders: 1 } },
            {
              loader: "postcss-loader",
              options: {
                config: {
                  path: fileExistsInCwd("postcss.config.js")
                    ? process.cwd()
                    : path.resolve(__dirname),
                },
              },
            },
          ],
        },
      ],
    },
  },
};
