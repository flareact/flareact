const cmd = require('node-cmd');
const fs = require('fs');
const path = require('path');
const TOML = require("@iarna/toml")
const projectDir = process.cwd();

const parseNamespaceList = (list, projectName) => {
  const parsed = JSON.parse(list);
  const binding = {
    binding: '_flareact_default',
    id: null,
    preview_id: null
  }

  parsed.forEach((kv) => {
    if (kv.title === `${projectName}-_flareact_default`) {
      binding.id = kv.id;
    }
    if (kv.title === `${projectName}-_flareact_default_preview`) {
      binding.preview_id = kv.id;
    }
  })
  return (binding);
}

module.exports.writeDataToToml = (data) => {
  const wranglerToml = fs.readFileSync(path.join(projectDir, "wrangler.toml"));
  const wranglerConf = TOML.parse(wranglerToml);
  const {name} = wranglerConf;
  const bindingObj = parseNamespaceList(data, name);

  if (wranglerConf.kv_namespaces) {
    !wranglerConf.kv_namespaces.find((namespace) => namespace.binding === '_flareact_default') && wranglerConf.kv_namespaces.push(bindingObj)
  } else {
    wranglerConf.kv_namespaces = [bindingObj]
  }
  fs.writeFile(path.join(projectDir, "wrangler.toml"), TOML.stringify(wranglerConf), (err) => {
    if (err) {
      throw err;
    }
  })
}