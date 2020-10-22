import { DYNAMIC_PAGE } from "./worker/pages";

/**
 * Extract dynamic params from a slug path. For use in the router, but should eventually
 * be refactored to share responsibilities with the /worker/pages.js module.
 *
 * @param {string} source e.g. /articles/[slug]
 * @param {string} path   e.g. /articles/hello-world
 * @returns {<[string]: string>} e.g. { slug: 'hello-world' }
 */
export function extractDynamicParams(source, path) {
  let test = source;
  let parts = [];
  let params = {};

  for (const match of source.matchAll(/\[(\w+)\]/g)) {
    parts.push(match[1]);

    test = test.replace(DYNAMIC_PAGE, () => "([\\w_-]+)");
  }

  test = new RegExp(test, "g");

  const matches = path.matchAll(test);

  for (const match of matches) {
    parts.forEach((part, idx) => (params[part] = match[idx + 1]));
  }

  return params;
}
