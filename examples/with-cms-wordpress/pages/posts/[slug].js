import { getPost } from "../../lib/wordpress";
import Link from "flareact/link";

export async function getStaticProps({ params }) {
  const { slug } = params;

  const post = await getPost(slug);

  return {
    props: {
      post,
    },
    // Revalidate every 8 hours
    revalidate: 60 * 60 * 8,
  };
}

export default function Post({ post }) {
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
