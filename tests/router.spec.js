import React from "react";
import { RouterProvider, useRouter } from "../src/router";
import { render, screen } from "@testing-library/react";

it("knows basic information about a route", () => {
  render(
    <RouterProvider
      initialUrl="https://demo.workers.dev/hello/world"
      initialPagePath="/hello/[slug]"
      initialComponent={Noop}
    >
      <RouteTest />
    </RouterProvider>
  );

  expect(screen.getByTestId("pathname").innerHTML).toBe("/hello/[slug]");
  expect(screen.getByTestId("asPath").innerHTML).toBe("/hello/world");
  expect(screen.getByTestId("query").innerHTML).toBe(
    JSON.stringify({ slug: "world" })
  );
});

function RouteTest() {
  const router = useRouter();

  return (
    <div>
      <p data-testid="pathname">{router.pathname}</p>
      <p data-testid="asPath">{router.asPath}</p>
      <p data-testid="query">{JSON.stringify(router.query)}</p>
    </div>
  );
}

function Noop() {
  return <p>Hi</p>;
}
