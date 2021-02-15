export default async function checkRedirectUrl({ normalizedPathname, config }) {
  const redirects = await config.redirects();
  const reducedRedirects = redirects.find(
    (item) => item.source === normalizedPathname
  );
  return reducedRedirects;
}
