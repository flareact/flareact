# Custom App Page

It's likely that you will want to import global stylesheets, or wrap your entire application in a layout component or [React Context](https://reactjs.org/docs/context.html) provider.

To do so, you can define your own custom `App` component which Flareact will pull in to render your app.

Define a `pages/_app.js` file, and be sure to return `<Component {...pageProps} />`:

```js
export default function MyApp({ Component, pageProps }) {
  // Your custom stuff here

  return <Component {...pageProps} />;
}
```
