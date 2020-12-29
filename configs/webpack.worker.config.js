const baseConfig = require("./webpack.config");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const { flareactConfig } = require("./utils");
const defaultLoaders = require("./loaders");
const { nanoid } = require("nanoid");
const fs = require("fs");
const TOML = require("@iarna/toml");

const dev = !!process.env.WORKER_DEV;
const isServer = true;
const projectDir = process.cwd();
const flareact = flareactConfig(projectDir);
const wranglerToml = fs.readFileSync(path.join(projectDir, "wrangler.toml"));

const outPath = path.resolve(projectDir, "out");

const wranglerConfig = TOML.parse(wranglerToml);
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

  const namespaces = wranglerConfig.kv_namespaces || [];
  const defaultKVNamespace = namespaces.find((namespace) =>
    namespace.binding.startsWith("_flareact_default")
  );

  if (defaultKVNamespace) {
    inlineVars["DEFAULT_KV_NAMESPACE"] = defaultKVNamespace.binding;
  }

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
