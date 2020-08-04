import React from "react";

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
        <script src="/client.js"></script>
      </body>
    </html>
  );
}
