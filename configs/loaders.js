module.exports = function ({ dev, isServer }) {
  return {
    babel: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
        plugins: [
          "react-require",
          "@babel/plugin-transform-runtime",
          Boolean(dev && !isServer) && require.resolve("react-refresh/babel"),
        ].filter(Boolean),
      },
    },
  };
};
