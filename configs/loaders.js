module.exports = function ({ dev, isServer }) {
  return {
    babel: {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env", "@babel/preset-react"],
        plugins: [
          "react-require",
          "@babel/plugin-transform-runtime",
          Boolean(dev && !isServer) && require.resolve("react-refresh/babel"),
          !isServer &&
            require.resolve("./babel/plugins/flareact-edge-transform"),
        ].filter(Boolean),
      },
    },
  };
};
