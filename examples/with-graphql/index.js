import { handleEvent } from "../../src/worker/worker";

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = true;

addEventListener("fetch", async (event) => {
  try {
    event.respondWith(
      handleEvent(
        event,
        require.context("./pages/", true, /\.(js|jsx|ts|tsx|graphql)$/),
        true
      )
    );
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e, {
          status: 502,
        })
      );
    }
    event.respondWith(
      new Response("Internal Error", {
        status: 501,
      })
    );
  }
});
