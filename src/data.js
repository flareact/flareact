import useSWR from "swr";

export function getKVStore(env) {
  return env.namespaces.kv._default;
}

export function useData(key) {
  const fetcher = (url) => fetch(url).then((r) => r.json());

  let options = {
    key,
  };

  const params = new URLSearchParams(options);

  const { data, error } = useSWR(`/_flareact/data/kv/read?${params}`, fetcher);

  return { data: data?.value, error };
}
