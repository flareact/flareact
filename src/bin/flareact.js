#!/usr/bin/env node
const fs = require("fs");
const concurrently = require("concurrently");
const dotenv = require("dotenv");
dotenv.config();

["react", "react-dom"].forEach((dependency) => {
  try {
    require.resolve(dependency);
  } catch (err) {
    console.warn(
      `The module '${dependency}' was not found. Flareact requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install ${dependency}'`
    );
  }
});

const yargs = require("yargs");

let rootPath = "";
let webpackConfigPath =
  "node_modules/flareact/configs/webpack.client.config.js";

let isWebpackConfigFound = () => fs.existsSync(rootPath + webpackConfigPath);

for (let i = 0; i < 3; i++) {
  if (isWebpackConfigFound()) {
    break;
  }
  rootPath += "../";
}

if (isWebpackConfigFound()) {
  webpackConfigPath = rootPath + webpackConfigPath;
} else {
  const firstLine =
    "⚠ Cannot find node_modules/flareact/configs/webpack.client.config.js.";
  const secondLine =
    "⚠ Make sure all your dependencies are installed. If your project is a monorepo,";
  const thirdLine =
    "⚠ make sure Flareact workspace is not nested more than 3 levels.";
  console.error(firstLine + "\n" + secondLine + "\n" + thirdLine + "\n");
  process.exit(1);
}

const argv = yargs
  .command("dev", "Starts a Flareact development server")
  .command("publish", "Builds Flareact for production and deploys it", {
    env: {
      description: "The Cloudflare Workers environment to target",
      type: "string",
    },
  })
  .command("build", "Builds Flareact for production")
  .help()
  .command({
    command: "*",
    handler() {
      yargs.showHelp();
    },
  })
  .demandCommand()
  .alias("help", "h").argv;

if (argv._.includes("dev")) {
  console.log("🚀 Starting Flareact dev server on http://localhost:8080 ...\n");

  concurrently(
    [
      {
        command: "wrangler dev",
        name: "worker",
        env: { WORKER_DEV: true, IS_WORKER: true },
      },
      {
        command: `webpack-dev-server --config ${webpackConfigPath} --mode development`,
        name: "client",
        env: { NODE_ENV: "development" },
      },
    ],
    {
      prefix: "name",
      killOthers: ["failure"],
      restartTries: 0,
    }
  ).then(
    () => {},
    (error) => {
      console.error(error);
    }
  );
}

if (argv._.includes("publish")) {
  const destination = argv.env ? `${argv.env} on Cloudflare` : "Cloudflare";

  console.log(`Publishing your Flareact project to ${destination}...`);

  let wranglerPublish = `wrangler publish`;

  if (argv.env) {
    wranglerPublish += ` --env ${argv.env}`;
  }

  concurrently(
    [
      {
        command: `webpack --config ${webpackConfigPath} --out ./out --mode production && ${wranglerPublish}`,
        name: "publish",
        env: { NODE_ENV: "production", IS_WORKER: true },
      },
    ],
    {
      prefix: "name",
      killOthers: ["failure"],
      restartTries: 0,
    }
  ).then(
    () => {},
    (error) => {
      console.error(error);
    }
  );
}

if (argv._.includes("build")) {
  console.log("Building your Flareact project for production...");

  concurrently(
    [
      {
        command: `webpack --config ${webpackConfigPath} --out ./out --mode production`,
        name: "publish",
        env: { NODE_ENV: "production" },
      },
    ],
    {
      prefix: "name",
      killOthers: ["failure"],
      restartTries: 0,
    }
  ).then(
    () => {},
    (error) => {
      console.error(error);
    }
  );
}
