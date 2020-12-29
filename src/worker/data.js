import { getKVStore } from "../data";

/**
 * Incoming pathname looks like:
 * /_flareact/data/kv/read
 */
export async function handleDataRequest({ event, env }) {
  const url = new URL(event.request.url);
  const endpoint = url.pathname.replace("/_flareact/data/", "");
  const params = url.searchParams;

  // e.g. [kv, read]
  const [type, method] = endpoint.split("/");

  if (type === "kv") {
    const store = getKVStore(env);

    if (method === "read") {
      if (params.has("key")) {
        const data = await store.get(params.get("key"));

        // TODO: Infer type
        const response = {
          value: data,
        };

        return new Response(JSON.stringify(response), {
          headers: { "content-type": "application/json" },
        });
      }

      const data = await store.list();

      // TODO: Infer type
      const response = {
        value: data.keys,
      };

      return new Response(JSON.stringify(response), {
        headers: { "content-type": "application/json" },
      });
    } else if (method === "write") {
      if (params.has("key") && params.has("value")) {
        try {
          await store.put(params.get("key"), params.get("value"));
          return new Response (null, {status: 200});
        } catch (err) {
          console.log(err);
          return new Response (null, {status: 500});
        }
      }
    }
  }
  throw new Error(`Data endpoint ${endpoint} not yet supported`);
}
