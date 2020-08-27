const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const defaultLoaders = require("./loaders");
const { fileExistsInDir } = require("./utils");

module.exports = function ({ dev, isServer }) {
  const loaders = defaultLoaders({ dev, isServer });

  return {
    context: process.cwd(),
    plugins: [new MiniCssExtractPlugin()],
    // TODO: Hide again
    // stats: "errors-warnings",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(flareact)\/).*/,
          use: loaders.babel,
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: dev,
              },
            },
            { loader: "css-loader", options: { importLoaders: 1 } },
            {
              loader: "postcss-loader",
              options: {
                config: {
                  path: fileExistsInDir(process.cwd(), "postcss.config.js")
                    ? process.cwd()
                    : path.resolve(__dirname),
                },
              },
            },
          ],
        },
      ],
    },
  };
};
