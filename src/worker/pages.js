export function getPage(pagePath, context) {
  try {
    return context(`.${pagePath}.js`);
  } catch (e) {
    throw new PageNotFoundError();
  }
}

export async function getClientPage(pagePath) {
  try {
    console.log(`${process.cwd()}pages/${pagePath}.js`);
    return import(`${process.cwd()}pages/${pagePath}.js`);
  } catch (e) {
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
