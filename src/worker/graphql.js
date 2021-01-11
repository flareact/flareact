import { createClient } from "@urql/core";

export function resolvegraphqlPath(graphqlPath, keys) {
  graphqlPath = graphqlPath.replace('index', 'schema')
  const graphqlsMap = keys.map((graphql) => {
    let test = graphql;

    const isDynamic = DYNAMIC_PAGE.test(page);

    if (isDynamic) {
      for (const match of page.matchAll(/\[(\w+)\]/g)) {
        parts.push(match[1]);
      }

      test = test.replace(DYNAMIC_PAGE, () => "([\\w_-]+)");

    test = test
      .replace("/", "\\/")
      .replace(/^\./, "")
      .replace(/\.(graphql)$/, "");

    return {
      graphql,
      graphqlPath: graphql.replace(/^\./, "").replace(/\.(graphql)$/, ""),
      test: new RegExp("^" + test + "$", ""),
    };
  });

  /**
   * Quite possible there is no Graphql file. In which case return null
   */

  if (!graphqlsMap.length) return null;

  /**
   * First, try to find an exact match.
   */
  let graphql = graphqlsMap.find((p) => graphqlPath === p.graphqlPath);

  /**
   * If an exact match couldn't be found, try giving it another shot with /index at
   * the end. This helps discover dynamic nested schema pages.
   */
  if (!graphql) {
    graphql = graphqlsMap.find((p) => p.test.test(graphqlPath + "/schema"));
  };

  if (!graphql) return null;

  return graphql;
}

export function getGraphql(graphqlPath, context) {
  try {
    const resolvedGraphqlFile = resolvegraphqlPath(graphqlPath, context.keys());
    if(resolvedGraphqlFile){
      const graphqlContent = context(resolvedGraphqlFile.graphql);
      return graphqlContent;
    }
  } catch (e) {
    console.log(e)
  }
  return null;
}

export async function executeGQL(gqlNode, variables) {
  const stringifiedQuery = JSON.stringify(gqlNode.loc.source.body);
  
  const cache = caches.default;
  const cacheKey = getCacheKey(stringifiedQuery);
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;
  
  var client = await createClient({
    url: GRAPHQL_API,
  });
  result = await client.query(gqlNode, variables).toPromise();
  await cache.put(cacheKey, {props: result.data});
  return {props : result.data}
}

export class GraphQLNotFound extends Error {}