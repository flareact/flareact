#!/usr/bin/env node
const concurrently = require("concurrently");

["react", "react-dom"].forEach((dependency) => {
  try {
    require.resolve(dependency);
  } catch (err) {
    console.warn(
      `The module '${dependency}' was not found. Flareact requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install ${dependency}'`
    );
  }
});

console.log("Starting Flareact dev server...");

concurrently(
  [
    { command: "wrangler dev", name: "wrangler" },
    {
      command:
        "webpack --config node_modules/flareact/configs/webpack.client.config.js --out ./out --mode development --watch",
      name: "client",
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
