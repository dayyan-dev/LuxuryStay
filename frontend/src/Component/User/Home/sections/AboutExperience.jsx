import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { userAsset } from '../../../../utils/userAssets';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function AboutExperience() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/about`)
      .then(res => setAbout(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="hero-wrap section">
      <div className="hero-mask opacity-7 bg-black"></div>
      <div
        className="hero-bg jarallax"
        style={{ backgroundImage: `url(${userAsset('images/experience-bg.jpg')})` }}
      ></div>
      <div className="hero-content">
        <div className="container-xxl px-4">
          <div className="row g-5">
            <div className="col-lg-6 text-center wow fadeInLeft">
              <div className="position-relative d-inline-flex">
                <img className="img-fluid rounded-5" src={userAsset('images/experience.jpg')} alt="Experience" />
              </div>
            </div>
            <div className="col-lg-6 align-content-center wow fadeInRight">
              <p>
                <span className="text-3 text-light text-uppercase fw-600 rounded-pill border border-light border-opacity-25 px-3 py-1">
                  Our Experience
                </span>
              </p>
              <h2 className="heading-font-family text-white text-13 fw-600 lh-sm mb-4">
                Our Years of Experience Will <span className="text-primary">Serve the Best</span>
              </h2>
              <p className="text-7 text-light fw-500 lh-sm">
                We have <span className="text-primary">{about?.yearsOfExperience || 0}+ years</span> of experience &amp; we have great memories
              </p>
              <p className="text-light mb-4">
                {about?.story || 'With years of experience in hospitality, we are committed to delivering exceptional service to every guest.'}
              </p>

              <p className="mb-4">
                <Link className="btn btn-new btn-primary rounded-pill" to="/contact">
                  <span className="btn-text"><span>Contact Us</span></span>
                  <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
                </Link>
              </p>

              <div className="row g-4">
                <div className="col-6 col-sm-4">
                  <h3 className="text-11 text-white fw-600 mb-0">{about?.guestsServed || 0}+</h3>
                  <p className="text-light lh-sm mb-0">Happy Guests</p>
                </div>
                <div className="col-6 col-sm-4">
                  <h3 className="text-11 text-white fw-600 mb-0">{about?.staffMembers || 0}+</h3>
                  <p className="text-light lh-sm mb-0">Team Members</p>
                </div>
                <div className="col-6 col-sm-4">
                  <h3 className="text-11 text-white fw-600 mb-0">{about?.totalRooms || 0}+</h3>
                  <p className="text-light lh-sm mb-0">Hotel Rooms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}