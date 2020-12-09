# Built-In CSS Support

Flareact currently supports several styling methods:

## Standard CSS imports

You can import a standard CSS file into any component in your `pages` folder:

```js
import '../styles.css';

export default MyPage() {
  //
}
```

Your compiled stylesheet will be injected into your document. When deploying, your styles will be minimized automatically.

A few warnings about CSS support in Flareact:

- No support yet for Sass/Less/etc
- No support for scoped CSS Modules

## Global Styles

To import a global stylesheet in your application, create a [custom App page](/docs/custom-app-page) and import the style there.

In `pages/_app.js`:

```js
import "../styles.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

## PostCSS

Flareact processes all styles through [PostCSS](https://postcss.org/).

[Learn more about customizing your PostCSS config](/docs/custom-postcss-config).

## Examples

Since you can define a custom [`pages/_document.js`](/docs/custom-document-page), Flareact supports popular CSS-in-JS libraries like [styled-components](https://styled-components.com/).

Here are a list of CSS-in-JS examples you might find handy:

- [with-styled-components](https://github.com/flareact/flareact/tree/canary/examples/with-styled-components)
