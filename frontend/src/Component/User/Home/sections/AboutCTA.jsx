import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function AboutCTA() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/about`)
      .then(res => setAbout(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="call-to-action bg-primary section">
      <div className="container text-center">
        <h2 className="text-14 fw-600 text-white lh-sm wow fadeInUp mb-3">
          The Most Memorable <span className="text-black">Rest <br className="d-none d-md-block" />Time</span> Starts at {about?.hotelName || 'The Luxury Stay'}
        </h2>
        <p className="text-white text-5 mb-4 wow fadeInUp" data-wow-delay=".1s">
          {about?.tagline || ''}
        </p>
        <div className="wow fadeInUp" data-wow-delay=".2s">
          <Link className="btn btn-new btn-dark rounded-pill" to="/contact">
            <span className="btn-text"><span>Contact Us</span></span>
            <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
          </Link>
        </div>
      </div>
    </section>
  );
}