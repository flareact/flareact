const baseConfig = require("./webpack.config");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { flareactConfig } = require("./utils");
const defaultLoaders = require("./loaders");
const { nanoid } = require("nanoid");
const fs = require("fs");
const { CONFIG_FILE } = require("../src/constants");

const dev = !!process.env.WORKER_DEV;
const isServer = true;
const projectDir = process.cwd();
const flareact = flareactConfig(projectDir);

const outPath = path.resolve(projectDir, "out");

const buildManifest = dev
  ? {}
  : fs.readFileSync(
      path.join(outPath, "_flareact", "static", "build-manifest.json"),
      "utf-8"
    );

module.exports = function (env, argv) {
  let config = {
    ...baseConfig({ dev, isServer }),
    target: "webworker",
    entry: path.resolve(projectDir, "./index"),
  };

  config.plugins.push(
    new CopyPlugin([
      {
        from: path.resolve(projectDir, "public"),
        to: outPath,
      },
    ])
  );

  let inlineVars = {
    "process.env.BUILD_ID": JSON.stringify(nanoid()),
  };

  if (dev) {
    inlineVars.DEV = dev;
  } else {
    inlineVars["process.env.BUILD_MANIFEST"] = buildManifest;
  }

  config.plugins.push(new webpack.DefinePlugin(inlineVars));

  if (flareact.webpack) {
    config = flareact.webpack(config, {
      dev,
      isServer,
      isWorker: isServer,
      defaultLoaders: defaultLoaders({ dev, isServer }),
      webpack,
    });
  }

  if (flareact.redirects) {
    config.plugins.push(
      new CopyPlugin(
        [
          {
            from: `${projectDir}/${CONFIG_FILE}`,
            to: `./${CONFIG_FILE}`,
          },
        ],
      ),
    );
  }

  return config;
};
