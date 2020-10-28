import Link from "flareact/link";
import {WordpressConnector} from "../../lib/connectors/wordpress-connector";
import {Post} from "../../lib/dto/post";
import * as React from "react";

export async function getStaticProps({ params }) {
    const { slug } = params;

    const post = await WordpressConnector.getPost(slug);

    return {
        props: {
            post,
        },
        // Revalidate every 8 hours
        revalidate: 60 * 60 * 8,
    };
}

class PostProps {
    post: Post;
}

export default class PostPage extends React.Component<PostProps> {

    render() {
        const post = this.props.post;
        return (
            <div className="container">
                <h1>{post.title.rendered}</h1>
                <p>
                    <Link href="/">
                        <a>Home</a>
                    </Link>
                </p>
                <div
                    className="body"
                    dangerouslySetInnerHTML={{ __html: post.content.rendered }}
                />
            </div>
        );
    }

}
