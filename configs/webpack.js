module.exports = {
  baseConfig: {
    context: process.cwd(),
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
          use: ["style-loader", "css-loader"],
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
