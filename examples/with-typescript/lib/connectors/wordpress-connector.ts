import {Post} from "../dto/post";

class WordpressConnector {

    public static async getPosts(): Promise<Post[]> {
        const endpoint = `https://wpdemo.jplhomer.org/wp-json/wp/v2/posts`;
        const res = await fetch(endpoint);
        return await res.json();
    }

    public static async getPost(slug: string): Promise<Post> {
        const endpoint = `https://wpdemo.jplhomer.org/wp-json/wp/v2/posts?slug=${slug}&limit=1`;
        const res = await fetch(endpoint);
        const posts = await res.json();
        return posts[0];
    }

}

export {WordpressConnector};
