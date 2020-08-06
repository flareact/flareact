import React from "react";

export default function Document({ children, initialData }) {
  return (
    <html>
      <head>
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
        <script src="/client.js"></script>
      </body>
    </html>
  );
}
