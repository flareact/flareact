import React from "react";
import { htmlEscapeJsonString } from "../utils";

const dev = typeof DEV !== "undefined" && !!DEV;

export default function Document({
  initialData,
  helmet,
  page,
  context,
  buildManifest,
}) {
  const htmlAttrs = helmet.htmlAttributes.toComponent();
  const bodyAttrs = helmet.bodyAttributes.toComponent();
  let currentPage = page.page.replace(/^\./, "").replace(/\.(js|css)$/, "");

  // Flatten dynamic `index.js` pages
  if (currentPage !== "/index" && currentPage.endsWith("/index")) {
    currentPage = currentPage.replace(/\/index$/, "");
  }

  // TODO: Drop all these props into a context and consume them in individual components
  // so this page can be extended.

  return (
    <html lang="en" {...htmlAttrs}>
      <FlareactHead
        helmet={helmet}
        buildManifest={buildManifest}
        page={currentPage}
      />
      <body {...bodyAttrs}>
        <div id="__flareact" />
        <FlareactScripts
          initialData={initialData}
          page={currentPage}
          context={context}
          buildManifest={buildManifest}
        />
      </body>
    </html>
  );
}

export function FlareactHead({ helmet, page, buildManifest }) {
  let links = new Set();
  let criticalCss = [];

  if (!dev) {
    criticalCss = buildManifest.pages["criticalCss"];

    buildManifest.pages[page]
      .filter((link) => link.endsWith(".css"))
      .forEach((link) => links.add(link));
  }

  return (
    <head>
      <meta name="viewport" content="width=device-width" />
      <meta charset="utf-8" />
      {helmet.title.toComponent()}
      {helmet.meta.toComponent()}
      {helmet.link.toComponent()}
      {helmet.script.toComponent()}

      {[...criticalCss].map((css) => (
        <style dangerouslySetInnerHTML={{ __html: css }} />
      ))}

      {[...links].map((link) => (
        <>
          <style
            dangerouslySetInnerHTML={`
          </style>
          <link
            rel="preload"
            href="/_flareact/static/${link}"
            as="style"
            onLoad="this.onload=null;this.rel='stylesheet';"
          >
          `}
          />
          <noscript>
            <link rel="stylesheet" href={`/_flareact/static/${link}`} />
          </noscript>
        </>
      ))}
    </head>
  );
}

export function FlareactScripts({ initialData, page, buildManifest }) {
  let prefix = dev ? "http://localhost:8080/" : "/";
  prefix += dev ? "" : "_flareact/static/";

  let scripts = new Set();

  if (dev) {
    [
      "webpack.js",
      "main.js",
      `pages/_app.js`,
      `pages${page}.js`,
    ].forEach((script) => scripts.add(script));
  } else {
    buildManifest.helpers.forEach((script) => scripts.add(script));
    buildManifest.pages["/_app"]
      .filter((script) => script.endsWith(".js"))
      .forEach((script) => scripts.add(script));
    buildManifest.pages[page]
      .filter((script) => script.endsWith(".js"))
      .forEach((script) => scripts.add(script));
  }

  return (
    <>
      <script
        id="__FLAREACT_DATA"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: htmlEscapeJsonString(JSON.stringify(initialData)),
        }}
      ></script>
      {[...scripts].map((script) => (
        <script key={script} src={`${prefix}${script}`}></script>
      ))}
    </>
  );
}
