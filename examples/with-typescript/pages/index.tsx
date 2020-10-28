import Link from "flareact/link";
import * as React from "react";
import {WordpressConnector} from "../lib/connectors/wordpress-connector";
import {Post} from "../lib/dto/post";

export async function getEdgeProps() {
    const posts = await WordpressConnector.getPosts();

    return {
        props: {
            posts,
        },
        // Revalidate every 8 hours
        revalidate: 60 * 60 * 8,
    };
}

class IndexProps {
    posts: Post[];
}

export default class Index extends React.Component<IndexProps> {

    render() {
        return (
            <div className="container">
                <h1>WordPress, Powered by Flareact (now with typescript support)</h1>
                <div className="posts">
                    {this.props.posts.map((post) => {
                        return (
                            <div key={post.id} className="post">
                                <Link href={`/posts/${post.slug}`}>
                                    <a>{post.title.rendered}</a>
                                </Link>
                            </div>
                        );
                    })}
                </div>
                <br/>
                <br/>
                <Link href="/about"><a>About Flareact</a></Link>
            </div>
        );
    }

}
