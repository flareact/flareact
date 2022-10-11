import App from "../components/_app";
import Document from "../components/_document";

export const PAGE_EXTENSIONS = /\.(js|jsx|ts|tsx)$/;
export const DYNAMIC_PAGE = new RegExp("\\[(\\w+)\\]", "g");
export const CATCH_ALL = new RegExp("(.*?)/\\[\\.\\.\\.(\\w+)\\]");

function isSpecialPage(pagePath) {
  return /\/_(document|app)$/.test(pagePath);
}

function isIndexPage(pageKey) {
  return /\/[iI]ndex$/.test(pageKey);
}

export function resolvePagePath(pagePath, keys) {
  const pagesMap = keys.map((page) => {
    let test = page;
    let parts = [];
    let params = {};

    const isDynamic = DYNAMIC_PAGE.test(page);

    if (isDynamic) {
      for (const match of page.matchAll(/\[(\w+)\]/g)) {
        parts.push(match[1]);
      }

      test = test.replace(DYNAMIC_PAGE, () => "([^/]+)");
    }

    const isCatchall = CATCH_ALL.test(page);

    if (isCatchall) {
      const pageParts = page.match(CATCH_ALL);
      const paths = ("." + pagePath).replace(pageParts[1] + "/", "").split("/");
      params[pageParts[2]] = paths;
      test = pageParts[1] + paths.map(() => "/([^/]+)").join("");
    }

    test = test
      .replace("/", "\\/")
      .replace(/^\./, "")
      .replace(PAGE_EXTENSIONS, "");

    const pageWithoutExtension = page
      .replace(/^\./, "")
      .replace(PAGE_EXTENSIONS, "");

    if (isDynamic && isIndexPage(pageWithoutExtension)) {
      test = test.substr(0, test.length - "/index".length);
    }

    return {
      page,
      params,
      pagePath: pageWithoutExtension,
      parts,
      test: new RegExp("^" + test + "$", isDynamic ? "g" : ""),
    };
  });

  /**
   * First, try to find an exact match.
   */
  let page = pagesMap.find((p) => pagePath === p.pagePath);

  /**
   * If there's no exact match and the user is requesting a special page,
   * we need to return null as to not accidentally match a dynamic page below.
   */
  if (!page && isSpecialPage(pagePath)) {
    return null;
  }

  if (!page) {
    /**
     * Sort pages to include those with `index` in the name first, because
     * we need those to get matched more greedily than their dynamic counterparts.
     */
    pagesMap.sort((a) => (a.page.includes("index") ? -1 : 1));

    page = pagesMap.find((p) => p.test.test(pagePath));
  }

  /**
   * If an exact match couldn't be found, try giving it another shot with /index at
   * the end. This helps discover dynamic nested index pages.
   */
  if (!page) {
    page = pagesMap.find((p) => p.test.test(pagePath + "/index"));
  }

  if (!page) return null;

  /**
   * If pagePath ends in /index trim it off (unless page is /index) to match router
   * returned pagePath for the same page
   */
  page.pagePath = page.pagePath.replace(/(?<!^)\/index$/, "");

  if (!page.parts.length) return page;

  let params = {};

  page.test.lastIndex = 0;

  const matches = pagePath.matchAll(page.test);

  for (const match of matches) {
    page.parts.forEach((part, idx) => (params[part] = match[idx + 1]));
  }

  page.params = params;

  return page;
}

export function getPage(pagePath, context) {
  try {
    const resolvedPage = resolvePagePath(pagePath, context.keys());
    const page = context(resolvedPage.page);

    return {
      ...resolvedPage,
      ...page,
    };
  } catch (e) {
    if (pagePath === "/_app") {
      return { default: App };
    }

    if (pagePath === "/_document") {
      return { default: Document };
    }

    throw new PageNotFoundError();
  }
}

export async function getPageProps(page, query, event) {
  let pageProps = {};

  const params = page.params || {};

  const fetcher = page.getEdgeProps || page.getStaticProps;

  const queryObject = {
    ...query,
    ...params,
  };

  if (fetcher) {
    const { props, notFound, customHeaders, revalidate, redirect } = await fetcher({
      params,
      query: queryObject,
      event,
    });

    pageProps = {
      ...props,
      notFound,
      customHeaders,
      revalidate,
      redirect,
    };
  }

  return pageProps;
}

export class PageNotFoundError extends Error {}
