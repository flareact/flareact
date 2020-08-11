import { getPosts } from "../lib/wordpress";
import Link from "flareact/link";

export async function getEdgeProps() {
  const posts = await getPosts();

  return {
    props: {
      posts,
    },
    // Revalidate every 8 hours
    revalidate: 60 * 60 * 8,
  };
}

export default function Index({ posts = [] }) {
  return (
    <div className="container">
      <h1>WordPress, Powered by Flareact</h1>
      <div className="posts">
        {posts.map((post) => {
          return (
            <div key={post.id} className="post">
              <Link href={`/posts/${post.slug}`}>
                <a>{post.title.rendered}</a>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
