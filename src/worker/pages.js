export async function getPage(page) {
  try {
    // TODO: Point at user's pages dir
    return await import(`../pages/${page.replace(/^\//, "")}.js`);
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
