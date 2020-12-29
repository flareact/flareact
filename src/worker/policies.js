const DEFAULT_READ_POLICY = () => true;
const DEFAULT_READ_CLIENT_POLICY = () => false;

function getPolicies(context) {
  const key = context.keys().find((file) => file.startsWith("./data/policies"));

  if (!key) return null;

  return context(key);
}

export async function authorizeRead(context, request) {
  const check = getPolicies(context)?.read ?? DEFAULT_READ_POLICY;

  return check(request);
}

export async function authorizeReadClient(context, request) {
  const check = getPolicies(context)?.readClient ?? DEFAULT_READ_CLIENT_POLICY;

  return check(request);
}
