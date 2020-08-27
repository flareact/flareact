import React from "react";

const dev = typeof DEV !== "undefined" && !!DEV;

export default function Document({ initialData, helmet, page, context }) {
  const htmlAttrs = helmet.htmlAttributes.toComponent();
  const bodyAttrs = helmet.bodyAttributes.toComponent();

  // TODO: Drop all these props into a context and consume them in individual components
  // so this page can be extended.

  return (
    <html lang="en" {...htmlAttrs}>
      <head>
        <meta name="viewport" content="width=device-width" />
        <meta charset="utf-8" />
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}

        {/* TODO: Find way to not show this when there are no styles */}
        <link
          href={dev ? "http://localhost:8080/main.css" : "/main.css"}
          rel="stylesheet"
        />
      </head>
      <body {...bodyAttrs}>
        <div id="__flareact" />
        <FlareactScripts
          initialData={initialData}
          page={page}
          context={context}
        />
      </body>
    </html>
  );
}

export function FlareactScripts({ initialData, page, context }) {
  let prefix = dev ? "http://localhost:8080/" : "/";
  prefix += "_flareact/static/";
  const pagePrefix = prefix + "pages/";
  const hasCustomApp = context.keys().includes("./_app.js");

  // TODO: Clean up scripts based on whether it's dev

  return (
    <>
      <script
        id="initial-data"
        type="text/plain"
        data-json={JSON.stringify(initialData)}
      ></script>
      <script src={`${prefix}webpack.js`}></script>
      <script src={`${prefix}main.js`}></script>
      <script src={`${prefix}framework.js`}></script>
      {hasCustomApp && <script src={`${pagePrefix}_app.js`}></script>}
      <script src={`${pagePrefix}${page.page.replace(/^\.\//, "")}`}></script>
    </>
  );
}
