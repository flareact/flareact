import React from "react";

const dev = typeof DEV !== "undefined" && !!DEV;

export default function Document({ children, initialData }) {
  return (
    <html>
      <head>
        <title>Flareact</title>
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
