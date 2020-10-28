class PostContentProperty {
    rendered: string;
    protected: boolean;
}

class Post {
    id: number;
    slug: string;

    title: PostContentProperty;
    content: PostContentProperty;
    excerpt: PostContentProperty;
}

export {Post, PostContentProperty};
