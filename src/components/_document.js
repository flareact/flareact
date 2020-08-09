import React from "react";

const dev = typeof DEV !== "undefined" && !!DEV;

export default function Document({ initialData, helmet }) {
  const htmlAttrs = helmet.htmlAttributes.toComponent();
  const bodyAttrs = helmet.bodyAttributes.toComponent();

  return (
    <html {...htmlAttrs}>
      <head>
        <meta name="viewport" content="width=device-width" />
        <meta charset="utf-8" />
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}

        {/* TODO: Find way to not show this when there are no styles */}
        <link href="/main.css" rel="stylesheet" />
      </head>
      <body {...bodyAttrs}>
        <div id="__flareact" />
        <script
          id="initial-data"
          type="text/plain"
          data-json={JSON.stringify(initialData)}
        ></script>
        <script
          src={dev ? "http://localhost:8080/client.js" : "/client.js"}
        ></script>
      </body>
    </html>
  );
}
