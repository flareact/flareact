#!/usr/bin/env node
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

const command = process.argv[2];

if (command === "dev") {
  console.log("Starting Flareact dev server...");

  concurrently(
    [
      {
        command: "wrangler dev",
        name: "worker",
        env: { WORKER_DEV: true, IS_WORKER: true },
      },
      {
        command:
          "webpack-dev-server --config node_modules/flareact/configs/webpack.client.config.js --mode development",
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

if (command === "publish") {
  console.log("Publishing your Flareact project to Cloudflare...");

  concurrently(
    [
      {
        command:
          "webpack --config node_modules/flareact/configs/webpack.client.config.js --out ./out --mode production && wrangler publish",
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

if (command === "build") {
  console.log("Building your Flareact project for production...");

  concurrently(
    [
      {
        command:
          "webpack --config node_modules/flareact/configs/webpack.client.config.js --out ./out --mode production",
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
