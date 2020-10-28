import Link from "flareact/link";
import * as React from "react";

export async function getEdgeProps() {
    return {
        props: {

        },
        // Revalidate every 8 hours
        revalidate: 60 * 60 * 8,
    };
}

class AboutProps {
}

export default class AboutPage extends React.Component<AboutProps> {

    render() {
        return (
            <div className="container">
                <h1>About flareact</h1>
                <p>Check this out for more infos about flareact:</p>
                <a href="https://www.flareact.com/">flareact.com</a>
            </div>
        );
    }

}
