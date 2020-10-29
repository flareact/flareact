# Built-In CSS Support

Flareact currently supports **standard CSS imports**:

```js
import '../styles.css';

export default MyComponent() {
  //
}
```

Your compiled stylesheet will be injected into your document. When deploying, your styles will be minimized automatically.

A few warning about CSS support in Flareact:

- No support yet for Sass/Less/etc
- No support for scoped CSS Modules
- In production, Flareact will always attempt to load a `main.css` stylesheet, even if you don't have styles defined. _lol, sorry._

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
