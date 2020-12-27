import useSWR from "swr";

const fetcher = (url) => fetch(url).then((r) => r.json());

export function getKVStore(env) {
  return env.namespaces.kv._default;
}

export function useData(key) {

  let options = {};
  if (key) options.key = key;

  const params = new URLSearchParams(options);

  const { data, error } = useSWR(`/_flareact/data/kv/read?${params}`, fetcher);

  return { data: data?.value, error };
}

export function useDataWrite(key, value) {

  let options = {};
  if (key) options.key = key;   //what keys are acceptable? only strings? this will filter out falsy keys like 0 -- do we want that?
  options.value = value;
  const params = new URLSearchParams(options);

  const { _, error } = useSWR(`/_flareact/data/kv/write?${params}`, fetcher);

  if (error) throw new Error (`
  useDataWrite failed to write the following to your default kv namespace:

    key: ${key},
    value: ${value},

  Did you remember to set up a default kv namespace?
  `);
}