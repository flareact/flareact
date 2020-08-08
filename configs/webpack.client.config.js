const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const projectDir = process.cwd();

const workerConfig = require(path.join(projectDir, "webpack.config.js"));

module.exports = (env, argv) => {
  const config = {
    ...workerConfig(env, argv),
    context: projectDir,
    // Override target to be a web web instead of webworker
    target: "web",
    // Override the entry point
    entry: "flareact/src/client/index.js",
    // Override the output
    output: {
      filename: "client.js",
      path: path.resolve(projectDir, "out"),
    },
    // Override plugins
    plugins: [new MiniCssExtractPlugin()],
    devServer: {
      contentBase: path.resolve(projectDir, "out"),
      hot: true,
      hotOnly: true,
      stats: "errors-warnings",
      noInfo: true,
      headers: {
        "access-control-allow-origin": "*",
      },
    },
    devtool: "source-map",
  };

  if (argv.mode === "development") {
    config.plugins.push(new ReactRefreshWebpackPlugin());

    // TODO: Find better way to modify babel plugins
    config.module.rules[0].use.options.plugins.push(
      require.resolve("react-refresh/babel")
    );

    config.output.publicPath = "http://localhost:8080/";
  }

  return config;
};
