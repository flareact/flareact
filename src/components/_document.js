import React from "react";

const dev = typeof DEV !== "undefined" && !!DEV;

export default function Document({ children, initialData }) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width" />
        <meta charset="utf-8" />
        <title>Flareact</title>
        {/* TODO: Find way to not show this when there are no styles */}
        <link href="/main.css" rel="stylesheet" />
      </head>
      <body>
        <div id="__flareact">{children}</div>
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
