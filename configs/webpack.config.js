const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const defaultLoaders = require("./loaders");
const { fileExistsInDir } = require("./utils");

module.exports = function ({ dev, isServer }) {
  const loaders = defaultLoaders({ dev, isServer });

  const postCssLoader = {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        config: fileExistsInDir(process.cwd(), "postcss.config.js")
          ? process.cwd()
          : path.resolve(__dirname),
      },
    },
  };

  const cssExtractLoader = {
    loader: MiniCssExtractPlugin.loader,
  };

  let sassOptionFiber = false;

  // Check if we can enable fibers or not. Its not supported in node versions 16 and up.
  if (parseInt(process.versions.node.split('.')[0]) < 16) {
    sassOptionFiber = require("fibers");
  }

  const sassLoader = {
    loader: "sass-loader",
    options: {
      implementation: require("sass"),
      sassOptions: {
        fiber: sassOptionFiber
      },
    },
  };

  const styleLoader = "style-loader";

  const finalStyleLoader = () => (dev ? styleLoader : cssExtractLoader);

  return {
    context: process.cwd(),
    plugins: [new MiniCssExtractPlugin()],
    stats: "errors-warnings",
    watchOptions: {
      ignored: ["**/.git/**", "**/node_modules/**", "**/out/**"],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules\/(?!(flareact)\/).*/,
          use: loaders.babel,
        },

        /**
         * For CSS Modules, process the styles on both the worker AND the client.
         * This is required in order to build class names in the rendered markup.
         */
        {
          test: /\.module\.s?css$/,
          use: [
            finalStyleLoader(),
            {
              loader: "css-loader",
              options: { importLoaders: 1 },
            },
            postCssLoader,
            sassLoader,
          ],
        },

        /**
         * For standard (non-module) CSS imports, only process styles in client bundles.
         */
        {
          test: /^(?!.*\.module\.s?css$).*\.s?css$/,
          use: isServer
            ? require.resolve("null-loader")
            : [
                finalStyleLoader(),
                {
                  loader: "css-loader",
                  options: { importLoaders: 1 },
                },
                postCssLoader,
                sassLoader,
              ],
        },
      ],
    },
    resolve: {
      extensions: [".js", ".json", ".jsx", ".ts", ".tsx"],
    },
  };
};
