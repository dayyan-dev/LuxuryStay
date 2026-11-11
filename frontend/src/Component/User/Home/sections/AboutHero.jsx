import { useState, useEffect } from 'react';
import axios from 'axios';
import { userAsset } from '../../../../utils/userAssets';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function AboutHero() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/about`)
      .then(res => setAbout(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="page-header page-header-text-light py-0 mb-0">
      <div className="hero-wrap py-5">
        <div className="hero-mask opacity-6 bg-black"></div>
        <div
          className="hero-bg hero-bg-scroll"
          style={{ backgroundImage: `url(${userAsset('images/slider/slide-2.jpg')})` }}
        ></div>
        <div className="hero-content py-2 py-lg-4 my-2 my-md-4">
          <div className="container text-center mt-5 pt-5 pb-2">
            <h1 className="text-17 mb-4 wow fadeInUp">About {about?.hotelName || 'Us'}</h1>
            <p className="text-light text-5 mb-4 wow fadeInUp" data-wow-delay=".1s">
              {about?.tagline || ''}
            </p>
            <ul className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay=".2s">
              <li><a href="/">Home</a></li>
              <li className="active">About Us</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}