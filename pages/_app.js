import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';

export default function MyApp({ Component, pageProps }) {
  return (
    <React.Fragment>
      <CssBaseline />
      <Component {...pageProps} />
    </React.Fragment>
  );
}