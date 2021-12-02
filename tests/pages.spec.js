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

it("matches dynamic pages with unicode", () => {
  const path = resolvePagePath("/posts/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9", [
    "./index.js",
    "./apples.js",
    "./posts/[slug].js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/[slug].js");
  expect(path.params).toEqual({ slug: "%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9" });
});

it("matches dynamic page indexes", () => {
  const path = resolvePagePath("/posts", [
    "./index.js",
    "./apples.js",
    "./posts/[slug].js",
    "./posts/index.js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/index.js");
});

it("matches dynamic page indexes matching directory names", () => {
  const path = resolvePagePath("/posts", [
    "./index.js",
    "./apples.js",
    "./posts/[slug].js",
    "./posts.js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts.js");
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

it("matches catch-all dynamic page", () => {
  const path = resolvePagePath("/posts/hello-world/it/me", [
    "./index.js",
    "./apples.js",
    "./posts/[...category].js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/[...category].js");
  expect(path.params).toEqual({
    category: ["hello-world","it","me"],
  });
});

it("matches catch-all dynamic page indexes", () => {
  const path = resolvePagePath("/posts", [
    "./index.js",
    "./apples.js",
    "./posts/[...category].js",
    "./posts/index.js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/index.js");
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

it("matches multiple dynamic pages with unicode", () => {
  const path = resolvePagePath("/posts/%D7%A2%D7%91%D7%A8%D7%99%D7%AA/%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9", [
    "./index.js",
    "./apples.js",
    "./posts/[category]/[slug].js",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/[category]/[slug].js");
  expect(path.params).toEqual({
    category: "%D7%A2%D7%91%D7%A8%D7%99%D7%AA",
    slug: "%D1%80%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9",
  });
});

it("matches multiple dynamic tsx pages", () => {
  const path = resolvePagePath("/posts/typescript/now-supported", [
    "./index.tsx",
    "./apples.tsx",
    "./posts/[category]/[slug].tsx",
  ]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./posts/[category]/[slug].tsx");
  expect(path.params).toEqual({
    category: "typescript",
    slug: "now-supported",
  });
});

it("does not mistake _app for a dynamic page", () => {
  const path = resolvePagePath("/_app", ["./[slug].js", "./_app.js"]);

  expect(path).toBeTruthy();
  expect(path.page).toBe("./_app.js");
});

it("returns when _app is missing", () => {
  const path = resolvePagePath("/_app", ["./[slug].js"]);

  expect(path).toBe(null);
});
