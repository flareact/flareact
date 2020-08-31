const loaderUtils = require("loader-utils");

module.exports = function () {
  const { absolutePagePath, page } = loaderUtils.getOptions(this);
  const stringifiedAbsolutePagePath = JSON.stringify(absolutePagePath);
  const stringifiedPage = JSON.stringify(page);

  return `
    (window.__FLAREACT_PAGES = window.__FLAREACT_PAGES || []).push([
      ${stringifiedPage},
      function () {
        return require(${stringifiedAbsolutePagePath});
      }
    ]);
  `;
};
