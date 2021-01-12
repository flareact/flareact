import { createClient } from "@urql/core";
import { DYNAMIC_PAGE } from './pages'

export function resolvegraphqlPath(graphqlPath, keys) {
  graphqlPath = graphqlPath.replace("index", "schema");
  const graphqlsMap = keys.map((graphql) => {
    let test = graphql;
    let parts = [];

    const isDynamic = DYNAMIC_PAGE.test(graphqlPath);

    if (isDynamic) {
      for (const match of graphqlPath.matchAll(/\[(\w+)\]/g)) {
        parts.push(match[1]);
      }

      test = test.replace(DYNAMIC_PAGE, () => "([\\w_-]+)");
    }

    test = test
      .replace("/", "\\/")
      .replace(/^\./, "")
      .replace(/\.(graphql)$/, "");

    return {
      graphql,
      graphqlPath: graphql.replace(/^\./, "").replace(/\.(graphql)$/, ""),
      parts,
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

  if (!graphql) {
    /**
     * Sort pages to include those with `index` in the name first, because
     * we need those to get matched more greedily than their dynamic counterparts.
     */
    graphqlsMap.sort((a) => (a.graphql.includes("schema") ? -1 : 1));

    graphql = graphqlsMap.find((p) => p.test.test(graphqlPath));
  }

  /**
   * If an exact match couldn't be found, try giving it another shot with /index at
   * the end. This helps discover dynamic nested schema pages.
   */
  if (!graphql) {
    graphql = graphqlsMap.find((p) => p.test.test(graphqlPath + "/schema"));
  }

  if (!graphql.parts.length) return graphql;

  let params = {};

  graphql.test.lastIndex = 0;

  const matches = graphqlPath.matchAll(graphql.test);

  for (const match of matches) {
    graphql.parts.forEach((part, idx) => (params[part] = match[idx + 1]));
  }

  graphql.params = params;

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

  try {
   const cache = caches.default;
   const cacheKey = stringifiedQuery;
   const cachedResponse = await cache.match(cacheKey);
   if (cachedResponse) return cachedResponse.body;

   var client = await createClient({
     url: GRAPHQL_API,
   });
   const result = await client.query(gqlNode, variables).toPromise();
   await cache.put(cacheKey, new Response({ props: result.data }));
   return { props: result.data }; 
  } catch (error) {
    console.log(error)
  }
}

export class GraphQLNotFound extends Error {}