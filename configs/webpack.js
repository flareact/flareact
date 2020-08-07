const path = require("path");
const fs = require("fs");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function fileExistsInCwd(file) {
  return fs.existsSync(path.join(process.cwd(), file));
}

module.exports = {
  baseConfig: {
    context: process.cwd(),
    plugins: [new MiniCssExtractPlugin()],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(flareact)\/).*/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: ["react-require", "@babel/plugin-transform-runtime"],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            { loader: "css-loader", options: { importLoaders: 1 } },
            {
              loader: "postcss-loader",
              options: {
                config: {
                  path: fileExistsInCwd("postcss.config.js")
                    ? process.cwd()
                    : path.resolve(__dirname),
                },
              },
            },
          ],
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: "html-loader",
            },
            {
              loader: "markdown-loader",
            },
          ],
        },
      ],
    },
  },
};
