const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const defaultLoaders = require("./loaders");
const { fileExistsInDir } = require("./utils");

module.exports = function ({ dev, isServer }) {
  const loaders = defaultLoaders({ dev, isServer });

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
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules\/(?!(flareact)\/).*/,
          use: loaders.babel,
        },
        {
          test: /\.css$/,
          use: [
            finalStyleLoader(),
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
