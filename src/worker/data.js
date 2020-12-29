import { getKVStore } from "../data";
import { authorizeRead, authorizeReadClient } from "./policies";

/**
 * Incoming pathname looks like:
 * /_flareact/data/kv/read
 */
export async function handleDataRequest({ event, env, context }) {
  const url = new URL(event.request.url);
  const endpoint = url.pathname.replace("/_flareact/data/", "");
  const params = url.searchParams;

  // e.g. [kv, read]
  const [type, method] = endpoint.split("/");

  if (type === "kv") {
    const store = getKVStore(env);

    if (method === "read") {
      const checks = await Promise.all([
        authorizeRead(context, event.request),
        authorizeReadClient(context, event.request),
      ]);

      if (!checks.every(Boolean)) {
        const response = { error: "Unauthorized." };

        return formatResponse(response);
      }

      const data = await store.get(params.get("key"));

      // TODO: Infer type
      const response = {
        value: data,
      };

      return formatResponse(response);
    }
  }

  throw new Error(`Data endpoint ${endpoint} not yet supported`);
}

function formatResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}
