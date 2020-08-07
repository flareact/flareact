import App from "../components/_app";

const DYNAMIC_PAGE = new RegExp("\\[(\\w+)\\]", "g");

export function resolvePagePath(pagePath, keys) {
  const pagesMap = keys.map((page) => {
    let test = page;
    let parts = [];

    const isDynamic = DYNAMIC_PAGE.test(page);

    if (isDynamic) {
      for (const match of page.matchAll(/\[(\w+)\]/g)) {
        parts.push(match[1]);
      }

      test = test.replace(DYNAMIC_PAGE, () => "([\\w_-]+)");
    }

    test = test.replace("/", "\\/").replace(/^\./, "").replace(/\.js$/, "");

    return {
      page,
      parts,
      test: new RegExp(test, isDynamic ? "g" : ""),
    };
  });

  let page = pagesMap.find((p) => p.test.test(pagePath));

  if (!page) return null;
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

    throw new PageNotFoundError();
  }
}

export async function getPageProps(page) {
  let pageProps = {};

  const params = page.params || {};

  if (page.getStaticProps) {
    const { props } = await page.getStaticProps({ params });

    pageProps = {
      ...props,
    };
  }

  return pageProps;
}

export class PageNotFoundError extends Error {}
