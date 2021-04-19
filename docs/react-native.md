# React Native integration (experimental)

Follow these steps to use Flareact with React Native and React Native Web.

First, run `react-native init YourAppName`. Move the following files and folders from the created `YourAppName` folder to your Flareact project root:
 - `android`
 - `ios`
 - `app.json`
 - `babel.config.js`
 - `flareact.config.js`
 - `App.js`
 - `index.js` - rename to `index.native.js`
 - `metro.config.js`

Add React Native to your project:

```bash
yarn add react-native react-native-web
yarn add -D babel-plugin-react-native-web
```

Then, in your project root directory create `flareact.config.js` with the following content:
```js
module.exports = {
  webpack: (config, { dev, isWorker, defaultLoaders, webpack }) => {
    const babelConfig = config.module.rules[0].use.options;
    babelConfig.plugins = [['react-native-web', { commonjs: true }]];

    // Taken from https://github.com/vercel/next.js/blob/86160a5190c50ea315c7ba91d77dfb51c42bc65f/examples/with-react-native-web/next.config.js
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];

    return config;
  },
};
```

In the `pages` directory create `_document.js` with the following content:
```jsx
import Document, { Html, Head, Main, FlareactScript } from 'flareact/document';
import React from 'react';
import { AppRegistry } from 'react-native';

import config from '../app.json';

// Taken from https://github.com/vercel/next.js/blob/3c992063135f553b507dd49d28d2b19aebed3ac6/examples/with-react-native-web/pages/_document.js
const normalizeFlareactElements = `
  #__flareact {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

class ReactNativeWebDocument extends Document {
  static async getEdgeProps(ctx) {
    // Based on https://github.com/vercel/next.js/blob/3c992063135f553b507dd49d28d2b19aebed3ac6/examples/with-react-native-web/pages/_document.js
    // and https://github.com/flareact/flareact/blob/148db4fe79f65b111ea495eae9c647a247cfd113/examples/with-styled-components/pages/_document.js
    AppRegistry.registerComponent(config.name, () => Main);

    const initialProps = await Document.getEdgeProps(ctx);
    const { getStyleElement } = AppRegistry.getApplication(config.name);

    return {
      ...initialProps,
      styles: (
        <>
          <style dangerouslySetInnerHTML={{ __html: normalizeFlareactElements }} />
          {initialProps.styles}
          {getStyleElement()}
        </>
      ),
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <FlareactScript />
        </body>
      </Html>
    );
  }
}

export default ReactNativeWebDocument;
```

Now your application has two entrypoints: `index.native.js` for the mobile app, and the original `index.js` (which you can now optionally rename to `index.web.js`) for the browser. You will probably want to use a separate library like `react-navigation` for your mobile app navigation, and place shared components in a separate `shared` folder.
