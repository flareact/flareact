import React, { Component, createContext, useContext } from "react";
import { htmlEscapeJsonString } from "../utils";

const dev = typeof DEV !== "undefined" && !!DEV;

const DocumentContext = createContext();

export default class Document extends Component {
  static async getEdgeProps(ctx) {
    const enhanceApp = (App) => (props) => <App {...props} />;

    const { html } = await ctx.renderPage({ enhanceApp });

    return { html };
  }

  static renderDocument(DocumentComponent, props) {
    return (
      <DocumentContext.Provider value={props}>
        <DocumentComponent {...props} />
      </DocumentContext.Provider>
    );
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <FlareactScript />
        </body>
      </Html>
    );
  }
}

export function Html(props) {
  const { helmet } = useContext(DocumentContext);
  const { htmlAttributes } = helmet.htmlAttributes.toComponent();

  return <html {...htmlAttributes} {...props} />;
}

export function Head() {
  const { helmet, currentPage, buildManifest } = useContext(DocumentContext);

  let links = new Set();

  if (!dev) {
    buildManifest.pages["/_app"]
      .filter((link) => link.endsWith(".css"))
      .forEach((link) => links.add(link));
    buildManifest.pages[currentPage]
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

      {[...links].map((link) => (
        <link key={link} href={`/_flareact/static/${link}`} rel="stylesheet" />
      ))}
    </head>
  );
}

export function Main() {
  const { html } = useContext(DocumentContext);
  return <div id="__flareact" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function FlareactScript() {
  const { buildManifest, page, currentPage, props } = useContext(
    DocumentContext
  );

  let prefix = dev ? "http://localhost:8080/" : "/";
  prefix += dev ? "" : "_flareact/static/";

  let scripts = new Set();

  if (dev) {
    [
      "webpack.js",
      "main.js",
      `pages/_app.js`,
      `pages${currentPage}.js`,
    ].forEach((script) => scripts.add(script));
  } else {
    buildManifest.helpers.forEach((script) => scripts.add(script));
    buildManifest.pages["/_app"]
      .filter((script) => script.endsWith(".js"))
      .forEach((script) => scripts.add(script));
    buildManifest.pages[currentPage]
      .filter((script) => script.endsWith(".js"))
      .forEach((script) => scripts.add(script));
  }

  const initialData = { page, props };

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
