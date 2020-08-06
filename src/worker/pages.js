import App from "../components/_app";

export function getPage(pagePath, context) {
  try {
    return context(`.${pagePath}.js`);
  } catch (e) {
    if (pagePath === "/_app") {
      return { default: App };
    }

    throw new PageNotFoundError();
  }
}

export async function getPageProps(page) {
  if (page.getStaticProps) {
    const { props } = await page.getStaticProps();
    return props;
  }

  return {};
}

export class PageNotFoundError extends Error {}
