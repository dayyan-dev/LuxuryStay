import { Link } from "react-router-dom";

export default function BlogListSection({ blogs }) {
  return (
    <div className="row">
      {blogs.map((post) => (
        <div key={post.id} className="col-12 mb-4">

          <Link to="/about">
            <img src={post.image} className="img-fluid rounded-5" alt={post.title || 'News'} />
          </Link>

          <h3>
            <Link to="/about">
              {post.title}
            </Link>
          </h3>

        </div>
      ))}
    </div>
  );
}