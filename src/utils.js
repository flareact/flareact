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

// This utility is based on https://github.com/zertosh/htmlescape
// License: https://github.com/zertosh/htmlescape/blob/0527ca7156a524d256101bb310a9f970f63078ad/LICENSE

const ESCAPE_LOOKUP = {
  "&": "\\u0026",
  ">": "\\u003e",
  "<": "\\u003c",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

const ESCAPE_REGEX = /[&><\u2028\u2029]/g;

export function htmlEscapeJsonString(str) {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
