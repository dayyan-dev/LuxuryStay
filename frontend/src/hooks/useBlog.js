// hooks/useBlog.js
import { useEffect, useState } from "react";
import axios from "axios";

const useBlog = (id) => {
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      const res = await axios.get(`/api/blogs/${id}`);
      setBlog(res.data);
    };

    if (id) fetchBlog();
  }, [id]);

  return blog;
};

export default useBlog;