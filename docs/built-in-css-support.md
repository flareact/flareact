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

## Global Styles

To import a global stylesheet in your application, create a [custom App page](/docs/custom-app-page) and import the style there.

In `pages/_app.js`:

```js
import "../styles.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

## CSS Modules

Flareact support [CSS Modules](https://github.com/css-modules/css-modules). This allows you to write scoped styles using the `[name].module.css` naming convention.

CSS Modules scope your styles automatically by generating a CSS class name behind the scenes. CSS Modules files can be imported **anywhere in your application**.

For example, you could create a component like `Alert` and store it in a `components/` folder.

First, create `components/Alert.module.css`:

```css
.text {
  font-weight: bold;
}
```

Next, create your component and import the CSS module as you would any other dependency. Each class within your CSS file will be available as a property on the imported `styles` object:

```js
import styles from "./Alert.module.css";

export default function Alert() {
  return <p className={styles.text}>Alert!</p>;
}
```

CSS Modules are an _optional feature_ and are only enabled for files ending in `.module.css` (or `.module.scss`).

In production, CSS modules files are smartly concatenated and minified to provide the optimal bundle size and loading pattern based on usage within your Flareact application.

## Sass

Flareact supports Sass out of the box. Any files ending in `.scss` will automatically be processed as normal stylesheets:

```scss
// styles/app.scss

.hello {
  .world {
    content: "hi";
  }
}
```

## PostCSS

Flareact processes all styles through [PostCSS](https://postcss.org/).

[Learn more about customizing your PostCSS config](/docs/custom-postcss-config).

## Examples

Since you can define a custom [`pages/_document.js`](/docs/custom-document-page), Flareact supports popular CSS-in-JS libraries like [styled-components](https://styled-components.com/).

Here are a list of CSS-in-JS examples you might find handy:

- [with-styled-components](https://github.com/flareact/flareact/tree/canary/examples/with-styled-components)
