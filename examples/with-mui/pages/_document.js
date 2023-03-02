
import * as React from 'react';
import Document, { Html, Head, Main, FlareactScript } from "flareact/document";
import { ServerStyleSheet } from "styled-components";
import { ServerStyleSheets } from '@mui/styles';

class MyDocument extends Document {
    static async getEdgeProps(ctx) {
        const sheet = new ServerStyleSheet();
        const materialSheets = new ServerStyleSheets();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) =>
                        sheet.collectStyles(materialSheets.collect(<App {...props} />)),
                });

            const initialProps = await Document.getEdgeProps(ctx);
            console.log("Packing styles:", initialProps.styles, materialSheets.getStyleElement(), sheet.getStyleElement())
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {materialSheets.getStyleElement()}
                        {sheet.getStyleElement()}
                    </>
                ),
            };
        } finally {
            sheet.seal();
        }
    }
    

    render() {
        return (
            <Html>
                <Head>
                    <meta charSet="utf-8" />
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                    />
                </Head>
                <body>
                    <Main />
                    <FlareactScript />
                </body>
            </Html>
        );
    }

}
export default MyDocument;
