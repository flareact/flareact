import "../styles.css";
import * as React from "react";

class AppProps {
    Component: any;
    pageProps: any;
}

export default class App extends React.Component<AppProps> {

    render() {
        const Component = this.props.Component;

        return (<Component {...this.props.pageProps} />);
    }
}
