const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const defaultLoaders = require("./loaders");
const { fileExistsInDir } = require("./utils");

module.exports = function ({ dev, isServer }) {
  const loaders = defaultLoaders({ dev, isServer });

  const postCssLoader = {
    loader: "postcss-loader",
    options: {
      config: {
        path: fileExistsInDir(process.cwd(), "postcss.config.js")
          ? process.cwd()
          : path.resolve(__dirname),
      },
    },
  };

  const cssExtractLoader = {
    loader: MiniCssExtractPlugin.loader,
  };

  const styleLoader = "style-loader";

  const finalStyleLoader = () => {
    if (dev) {
      if (isServer) return cssExtractLoader;
      return styleLoader;
    } else {
      return cssExtractLoader;
    }
  };

  return {
    context: process.cwd(),
    plugins: [new MiniCssExtractPlugin()],
    stats: "errors-warnings",
    watchOptions: {
      ignored: ['**/.git/**', '**/node_modules/**', '**/out/**']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(flareact)\/).*/,
          use: loaders.babel,
        },
        {
          test: /\.css$/,
          use: isServer
            ? require.resolve("null-loader")
            : [
                finalStyleLoader(),
                { loader: "css-loader", options: { importLoaders: 1 } },
                postCssLoader,
              ],
        },
        {
          test: /\.module\.css$/,
          use: isServer
            ? require.resolve("null-loader")
            : [
                finalStyleLoader(),
                {
                  loader: "css-loader",
                  options: { importLoaders: 1, modules: true },
                },
                postCssLoader,
              ],
        },
        {
          test: /\.scss$/i,
          use: [
            finalStyleLoader(),
            {
              loader: "css-loader",
              options: { importLoaders: 1 },
            },
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
                sassOptions: {
                  fiber: require("fibers"),
                },
              },
            },
            postCssLoader,
          ],
        },
        {
          test: /\.module\.scss$/i,
          use: [
            finalStyleLoader(),
            {
              loader: "css-loader",
              options: { importLoaders: 1, modules: true },
            },
            {
              loader: "sass-loader",
              options: {
                implementation: require("sass"),
                sassOptions: {
                  fiber: require("fibers"),
                },
              },
            },
            postCssLoader,
          ],
        },
      ],
    },
  };
};
