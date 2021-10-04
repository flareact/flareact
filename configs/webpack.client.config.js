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
const glob = require("glob");
const BuildManifestPlugin = require("./webpack/plugins/build-manifest-plugin");
const crypto = require("crypto");
const { nanoid } = require("nanoid");

const projectDir = process.cwd();
const flareact = flareactConfig(projectDir);
const dev = process.env.NODE_ENV === "development";
const isServer = false;

// Note: This buildId does NOT match that which is running in webpack.worker.config.js.
// This is merely used as a client cache-busting mechanism for items that absolutely change
// between deploys, e.g. build manifests.
const buildId = dev ? "dev" : nanoid();

const pageManifest = glob.sync("./pages/**/*.+(js|jsx|ts|tsx)");

let entry = {
  main: "flareact/src/client/index.js",
};

pageManifest.forEach((page) => {
  if (/pages\/api\//.test(page)) return;

  let pageName = page.match(/\/(.+)\.(js|jsx|ts|tsx)$/)[1];

  // Flatten any dynamic `index` pages
  if (pageName !== "pages/index" && pageName.endsWith("/index")) {
    pageName = pageName.replace(/\/index$/, "");
  }

  const pageLoaderOpts = {
    page: pageName,
    absolutePagePath: path.resolve(projectDir, page),
  };

  const pageLoader = `flareact-client-pages-loader?${stringify(
    pageLoaderOpts
  )}!`;

  entry[pageName] = pageLoader;
});

// Inject default _app unless user has a custom one
if (!entry["pages/_app"]) {
  const pageLoaderOpts = {
    page: "pages/_app",
    absolutePagePath: "flareact/src/components/_app.js",
  };

  const pageLoader = `flareact-client-pages-loader?${stringify(
    pageLoaderOpts
  )}!`;

  entry["pages/_app"] = pageLoader;
}

const totalPages = Object.keys(entry).filter(
  (key) => key.includes("pages") && !/pages\/api\//.test(key)
).length;

// TODO: Revisit
const isModuleCSS = (module) => {
  return (
    // mini-css-extract-plugin
    module.type === `css/mini-extract` ||
    // extract-css-chunks-webpack-plugin (old)
    module.type === `css/extract-chunks` ||
    // extract-css-chunks-webpack-plugin (new)
    module.type === `css/extract-css-chunks`
  );
};

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
            /**
             * N.B. most of this is borrowed from Next.js source code. I've tried to comment
             * my understanding of each item below, but I'm sure there's much to be desired.
             */
            chunks: "all",
            cacheGroups: {
              default: false,
              vendors: false,
              /**
               * First, grab the "normal" things: react, etc from node_modules. These will
               * for sure be in *every* component, so we might as well pull this out and make
               * it cacheable.
               */
              framework: {
                chunks: "all",
                name: "framework",
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
                priority: 40,
                // Don't let webpack eliminate this chunk (prevents this chunk from
                // becoming a part of the commons chunk)
                enforce: true,
              },
              /**
               * OK - we've got the framework out of the way. Next, we're going to pull out any LARGE
               * modules (> 160kb) that happen to be used in an entrypoint from node_modules. Even if
               * it's only used by a single chunk - don't care.
               */
              lib: {
                test(module) {
                  return (
                    module.size() > 160000 &&
                    /node_modules[/\\]/.test(module.identifier())
                  );
                },
                name(module) {
                  const hash = crypto.createHash("sha1");
                  if (isModuleCSS(module)) {
                    module.updateHash(hash);
                  } else {
                    if (!module.libIdent) {
                      throw new Error(
                        `Encountered unknown module type: ${module.type}. Please open an issue.`
                      );
                    }

                    hash.update(module.libIdent({ context: __dirname }));
                  }

                  return hash.digest("hex").substring(0, 8);
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
              },
              /**
               * Next, commons. I guess if *every single page* uses some of this code, this chunk is generated.
               * I'm not sure exactly what this would be, or why we care to split it out here instead of e.g. `shared`.
               */
              commons: {
                name: "commons",
                minChunks: totalPages,
                priority: 20,
              },
              /**
               * Here's another chunk. Not sure what the difference is between this and our pal `commons`. I guess this is
               * reserved for less-common chunks, used by at least two other chunks.
               */
              shared: {
                name(module, chunks) {
                  return (
                    crypto
                      .createHash("sha1")
                      .update(
                        chunks.reduce((acc, chunk) => {
                          return acc + chunk.name;
                        }, "")
                      )
                      .digest("hex") + (isModuleCSS(module) ? "_CSS" : "")
                  );
                },
                priority: 10,
                minChunks: 2,
                reuseExistingChunk: true,
              },
            },
            maxInitialRequests: 25,
            minSize: 20000,
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
      publicPath: "/_flareact/static/",
      chunkFilename: `${dev ? "[name]" : "[name].[contenthash]"}.js`,
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].[chunkhash].css",
      }),
      new BuildManifestPlugin({ buildId }),
    ],
    devServer: {
      index: "",
      contentBase: path.resolve(projectDir, "out"),
      hot: true,
      hotOnly: true,
      stats: "errors-warnings",
      noInfo: true,
      headers: {
        "access-control-allow-origin": "*",
      },
      proxy: {
        "/": "http://localhost:8787",
        "/_flareact": "http://localhost:8787",
      },
    },
    devtool: dev ? "source-map" : false,
  };

  if (dev) {
    config.plugins.push(new ReactRefreshWebpackPlugin());
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
