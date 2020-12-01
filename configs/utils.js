const path = require("path");
const fs = require("fs");

function fileExistsInDir(dir, file) {
  return fs.existsSync(path.join(dir, file));
}

module.exports.fileExistsInDir = fileExistsInDir;

module.exports.flareactConfig = function (dir) {
  const file = "flareact.config.js";

  return fileExistsInDir(dir, file) ? require(path.join(dir, file)) : {};
};

module.exports.wranglerConfig = function (dir) {
  const file = "wrangler.toml";

  return fs.readFileSync(path.join(dir, file));
};
