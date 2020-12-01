export function generateEnv() {
  let env = {
    namespaces: {
      kv: {},
    },
  };

  const defaultKVNamespace =
    typeof DEFAULT_KV_NAMESPACE !== "undefined" && DEFAULT_KV_NAMESPACE;

  if (!defaultKVNamespace) return env;

  env.namespaces.kv._default = defaultKVNamespace;

  return env;
}
