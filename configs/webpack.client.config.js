const baseConfig = require("./webpack.config");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const { stringify } = require("querystring");
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

const glob = require("glob");
const pageManifest = glob.sync("./pages/**/*.js");

let entry = {
  main: "flareact/src/client/index.js",
};

pageManifest.forEach((page) => {
  const pageName = page.match(/\/(.+)\.js$/)[1];

  const pageLoaderOpts = {
    page: pageName,
    absolutePagePath: path.resolve(projectDir, page),
  };

  const pageLoader = `flareact-client-pages-loader?${stringify(
    pageLoaderOpts
  )}!`;

  entry[pageName] = pageLoader;
});

const totalPages = Object.keys(pageManifest).length;

module.exports = (env, argv) => {
  const config = {
    ...baseConfig({ dev, isServer }),
    entry,
    optimization: {
      minimizer: [
        new TerserJSPlugin({
          terserOptions: {
            output: {
              comments: false,
            },
          },
          extractComments: false,
        }),
        new OptimizeCSSAssetsPlugin(),
      ],
      // Split out webpack runtime so it's not included in every single page
      runtimeChunk: {
        name: "webpack",
      },
      splitChunks: dev
        ? {
            cacheGroups: {
              default: false,
              vendors: false,
            },
          }
        : {
            chunks: "all",
            cacheGroups: {
              default: false,
              vendors: false,
              framework: {
                chunks: "all",
                name: "framework",
                filename: "[name].js",
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
                priority: 40,
                // Don't let webpack eliminate this chunk (prevents this chunk from
                // becoming a part of the commons chunk)
                enforce: true,
              },
            },
          },
    },
    context: projectDir,
    target: "web",
    resolveLoader: {
      alias: {
        "flareact-client-pages-loader": path.join(
          __dirname,
          "webpack",
          "loaders",
          "flareact-client-pages-loader"
        ),
      },
    },
    output: {
      path: path.resolve(projectDir, "out/_flareact/static"),
      // TODO: Some of these are still 404 in dev
      hotUpdateChunkFilename:
        "_flareact/static/webpack/[id].[hash].hot-update.js",
      hotUpdateMainFilename: "_flareact/static/webpack/[hash].hot-update.json",
    },
    plugins: [new MiniCssExtractPlugin()],
    devServer: {
      contentBase: path.resolve(projectDir, "out"),
      publicPath: "/_flareact/static/",
      hot: true,
      hotOnly: true,
      // TODO: Hide stats again
      // stats: "errors-warnings",
      // noInfo: true,
      headers: {
        "access-control-allow-origin": "*",
      },
    },
    devtool: dev ? "source-map" : null,
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
