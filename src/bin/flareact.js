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
let webpackClientConfigPath =
  "node_modules/flareact/configs/webpack.client.config.js";
let webpackWorkerConfigPath =
  "node_modules/flareact/configs/webpack.worker.config.js";

let isWebpackClientConfigFound = () => fs.existsSync(rootPath + webpackClientConfigPath);

for (let i = 0; i < 3; i++) {
  if (isWebpackClientConfigFound()) {
    break;
  }
  rootPath += "../";
}

if (isWebpackClientConfigFound()) {
  webpackClientConfigPath = rootPath + webpackClientConfigPath;
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
  .option('port', {
    alias: 'p',
    type: 'number',
    description: `Start the development server on the specified port`,
    default: 8080
  })
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
  console.log(`🚀 Starting Flareact dev server on http://localhost:${argv.port} ...\n`);

  concurrently(
    [
      {
        command: `webpack --config ${webpackWorkerConfigPath} --mode production && webpack --config ${webpackClientConfigPath} --mode production && wrangler dev`,
        name: "build",
        env: { NODE_ENV: "development", WORKER_DEV: true, IS_WORKER: true },
      },
      {
        command: `webpack-dev-server --config ${webpackClientConfigPath} --mode development --port ${argv.port}`,
        name: "dev-server",
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
        command: `webpack --config ${webpackClientConfigPath} --mode production && webpack --config ${webpackWorkerConfigPath} --mode production && ${wranglerPublish}`,
        name: "build",
        env: { NODE_ENV: "production",IS_WORKER: true },
      }
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
        command: `webpack --config ${webpackClientConfigPath} --mode production && webpack --config ${webpackWorkerConfigPath} --mode production`,
        name: "build",
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
