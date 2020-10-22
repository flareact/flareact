import { resolvePagePath } from "../src/worker/pages";

it("matches simple pages", () => {
  const path = resolvePagePath("/index", [
    "./index.js",
    "./apples.js",
    "./posts/[slug].js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./index.js");
});

it("matches dynamic pages", () => {
  const path = resolvePagePath("/posts/hello", [
    "./index.js",
    "./apples.js",
    "./posts/[slug].js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/[slug].js");
  expect(path.params).toEqual({ slug: "hello" });
});

it.only("matches dynamic page indexes", () => {
  const path = resolvePagePath("/posts", [
    "./index.js",
    "./apples.js",
    "./posts/[slug].js",
    "./posts/index.js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/index.js");
});

it("matches longer dynamic pages", () => {
  const path = resolvePagePath("/posts/hello-world-it-me", [
    "./index.js",
    "./apples.js",
    "./posts/[slug].js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/[slug].js");
  expect(path.params).toEqual({ slug: "hello-world-it-me" });
});

it("matches multiple dynamic pages", () => {
  const path = resolvePagePath("/posts/travel/hello-world-it-me", [
    "./index.js",
    "./apples.js",
    "./posts/[category]/[slug].js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/[category]/[slug].js");
  expect(path.params).toEqual({
    category: "travel",
    slug: "hello-world-it-me",
  });
});
