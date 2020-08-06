import { handleRequest } from ".";
import {
  getAssetFromKV,
  mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";

export async function handleEvent(event, context, DEBUG) {
  let options = {};

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  return await handleRequest(event, context, async () => {
    try {
      if (DEBUG) {
        // customize caching
        options.cacheControl = {
          bypassCache: true,
        };
      }
      return await getAssetFromKV(event, options);
    } catch (e) {
      // if an error is thrown try to serve the asset at 404.html
      if (!DEBUG) {
        try {
          let notFoundResponse = await getAssetFromKV(event, {
            mapRequestToAsset: (req) =>
              new Request(`${new URL(req.url).origin}/404.html`, req),
          });

          return new Response(notFoundResponse.body, {
            ...notFoundResponse,
            status: 404,
          });
        } catch (e) {}
      }

      return new Response(e.message || e.toString(), { status: 500 });
    }
  });
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return (request) => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request);
    let url = new URL(defaultAssetKey.url);

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, "/");

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey);
  };
}
