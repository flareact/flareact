# flareact/head

You can insert custom elements into your page's `<head>` tag by using the `flareact/head` component.

This is powered by [react-helmet](https://github.com/nfl/react-helmet/):

```js
import Head from "flareact/head";

export default function Index() {
  return (
    <div>
      <Head>
        <title>My page title</title>
      </Head>
      <h1>Hello, world.</h1>
    </div>
  );
}
```
