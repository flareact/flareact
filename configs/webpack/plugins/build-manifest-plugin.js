const { RawSource } = require("webpack-sources");

module.exports = class BuildManifestPlugin {
  createAssets(compilation, assets) {
    const namedChunks = compilation.namedChunks;

    const assetMap = {
      pages: {},
    };

    const mainJsChunk = namedChunks.get("main");
    const mainJsFiles = [...mainJsChunk.files].filter((file) =>
      file.endsWith(".js")
    );

    for (const entrypoint of compilation.entrypoints.values()) {
      let pagePath = entrypoint.name.match(/^pages[/\\](.*)$/);

      if (!pagePath) continue;

      const pageFiles = [...entrypoint.getFiles()].filter(
        (file) => file.endsWith(".css") || file.endsWith(".js")
      );

      assetMap.pages[`/${pagePath[1]}`] = [...mainJsFiles, ...pageFiles];
    }

    assets["build-manifest.json"] = new RawSource(
      JSON.stringify(assetMap, null, 2)
    );

    return assets;
  }

  apply(compiler) {
    compiler.hooks.emit.tap("FlareactBuildManifest", (compilation) => {
      this.createAssets(compilation, compilation.assets);
    });
  }
};
