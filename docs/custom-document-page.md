# Custom Document Page

If you need to customize the server-rendered HTML document of your application, you can define a custom `./pages/_document.js` component:

```js
import Document, { Html, Head, Main, FlareactScript } from "flareact/document";

class MyDocument extends Document {
  static async getEdgeProps(ctx) {
    const props = await Document.getEdgeProps(ctx);
    return { ...props };
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

export default MyDocument;
```

The code above is the default `Document` provided by Flareact. You can remove `getEdgeProps` or the render function from `MyDocument` if you don't need to change them.

`<Html>`, `<Head />`, `<Main />` and `<FlareactScript />` are required for the page to be properly rendered.

You can leverage these components to provide custom attributes, like a `lang` attribute on the `html` tag:

```js
<Html lang="en">
```
