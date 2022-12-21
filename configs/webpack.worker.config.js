const baseConfig = require("./webpack.config");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { flareactConfig } = require("./utils");
const defaultLoaders = require("./loaders");
const { nanoid } = require("nanoid");
const fs = require("fs");

const CONFIG_FILE = "flareact.config.js";

const dev = !!process.env.WORKER_DEV;
const isServer = true;
const projectDir = process.cwd();
const flareact = flareactConfig(projectDir);

const outPath = path.resolve(projectDir, "out");

if (flareact.redirects) {
  async function writeConfigFile() {
    const redirects = await flareact.redirects();
    fs.writeFileSync(
      `${projectDir}/node_modules/flareact/src/worker/${CONFIG_FILE}`,
      `export const config = { redirects: ${JSON.stringify(
        redirects,
        null,
        4
      )}}`
    );
  }
  writeConfigFile();
} else {
  fs.writeFileSync(
    `${projectDir}/node_modules/flareact/src/worker/${CONFIG_FILE}`,
    `export const config = {}`
  );
}

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
    output: {
      path: path.resolve(projectDir, "./worker"),
      filename:'script.js'
    }
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

  return config;
};
