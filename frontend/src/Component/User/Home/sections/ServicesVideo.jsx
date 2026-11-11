import React from 'react';
import { userAsset } from '../../../../utils/userAssets';

const ServicesVideo = () => {
  return (
    <section className="hero-wrap section">
      <div className="hero-mask opacity-5 bg-black"></div>
      <div 
        className="hero-bg jarallax" 
        style={{ backgroundImage: `url(${userAsset('images/slider/slide-2.jpg')})` }}
      ></div>
      <div className="hero-content">
        <div className="container text-center">
          {/* <a className="glightbox rounded-circle d-inline-flex mb-4 wow fadeInUp" href="https://www.youtube.com/embed/s8vnc9l8sz4">
            <span className="playButton playButton-pulsing text-white bg-white bg-opacity-50">
              <i className="fa-solid fa-play"></i>
            </span>
          </a> */}
          <h2 className="text-19 fw-600 text-white lh-sm wow fadeInUp" data-wow-delay=".2s">
            Enjoy Facilities of Unmatched Quality!
          </h2>
        </div>
      </div>
    </section>
  );
};

export default ServicesVideo;