import { createClient } from "@urql/core";

export function resolvegraphqlPath(graphqlPath, keys) {
  const graphqlsMap = keys.map((graphql) => {
    let test = graphql;

    test = test.replace("/", "\\/").replace(/^\./, "").replace(/\.(graphql)$/, "");

    return {
      graphql,
      graphqlPath: graphql.replace(/^\./, "").replace(/\.(graphql)$/, "").replace("schema",""),
      test: new RegExp("^" + test + "$",""),
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
     * Sort graphqls to include those with `index` in the name first, because
     * we need those to get matched more greedily than their dynamic counterparts.
     */
    graphqlsMap.sort((a) => (a.graphql.includes("index") ? -1 : 1));

    graphql = graphqlsMap.find((p) => p.test.test(graphqlPath));
  }

  /**
   * If an exact match couldn't be found, try giving it another shot with /index at
   * the end. This helps discover dynamic nested index graphqls.
   */
  if (!graphql) {
    graphql = graphqlsMap.find((p) => p.test.test(graphqlPath + "/index"));
  }

  if (!graphql) return null;

  return graphql;
}

export function getGraphql(graphqlPath, context) {
  try {
    const resolvedGraphqlFile = resolvegraphqlPath(graphqlPath, context.keys());
    const graphqlContent = context(resolvedGraphqlFile.graphql);

    return "`" + graphqlContent + "`";
  } catch (e) {
    console.log(e)
    return null;
  }
}

export async function exec_gql(gqlNode, variables, variables) {
  var client = await createClient({
    url: GRAPHQL_API,
  });
  const result = await client.query(gqlNode, variables).toPromise();
  return {props : result}
}

export class GraphQLNotFound extends Error {}