const path = require("path");

module.exports = function ({ dev, isServer }) {
  return {
    babel: {
      loader: path.join(__dirname, "babel/flareact-babel-loader.js"),
      options: {
        dev,
        isServer,
      },
    },
  };
};
