import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { userAsset } from '../../../../utils/userAssets';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BASE_URL = (process.env.REACT_APP_SERVER_URL || 'http://localhost:5001');

export default function AboutIntro() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/about`)
      .then(res => setAbout(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      {/* Intro Section */}
      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 wow fadeInLeft">
              <p>
                <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
                  About {about?.hotelName || 'The Luxury Stay'}
                </span>
              </p>
              <h2 className="heading-font-family text-13 fw-600 lh-sm mb-4">
                {about?.tagline || 'Where Comfort Meets Excellence'}
              </h2>
              <p className="text-5 text-body-secondary">
                {about?.story || 'Our hotel has been providing exceptional hospitality since our founding.'}
              </p>

              <div className="d-inline-flex align-items-center gap-4">
                <Link className="btn btn-new btn-primary rounded-pill" to="/room">
                  <span className="btn-text"><span>Rooms & Suites</span></span>
                  <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
                </Link>
                {/* <div className="d-flex align-items-center gap-3 ms-sm-2 h-100">
                  <div className="text-body-tertiary text-7 opacity-7 d-inline-flex"><i className="fa-solid fa-phone-volume"></i></div>
                  <div className="vr my-1 opacity-1"></div>
                  <div className="text-start">
                    <div className="text-2 fw-600 text-body-tertiary mb-1">Call us for Inquiry:</div>
                    <h3 className="text-4 fw-700 mb-0">(+060) 444 5346</h3>
                  </div>
                </div> */}
              </div>
            </div>
            <div className="col-lg-6 text-center wow fadeInRight">
              <div className="position-relative d-inline-flex">
                <img className="img-fluid rounded-5" src={userAsset('images/about.jpg')} alt="About" />
                <div className="position-absolute top-0 end-0">
                  <div className="circle-text bg-white border border-2 border-primary mt-5 me-5 wow bounceIn" data-wow-delay="0.5s">
                    <svg viewBox="0 0 500 500">
                      <defs>
                        <path id="circlePath" d="M50,250c0-110.5,89.5-200,200-200s200,89.5,200,200s-89.5,200-200,200S50,360.5,50,250"></path>
                      </defs>
                      <text className="text-uppercase fw-700 ls-4">
                        <textPath xlinkHref="#circlePath">{about?.hotelName || 'Luxury Hotel'} ✦ Experience ✦</textPath>
                      </text>
                    </svg>
                    <div className="circle-icon text-bg-primary translate-middle">
                      <i className="fa-solid fa-bell-concierge"></i>
                    </div>
                  </div>
                </div>
                <div className="position-absolute bottom-0 start-50 translate-middle-x w-100">
                  <div className="text-light text-start bg-dark bg-opacity-50 rounded-5 m-5 p-4 wow fadeInUp">
                    {about?.tagline || 'A new kind of hospitality experience.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="section bg-light-1">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 wow fadeInLeft">
              <div className="bg-white rounded-5 p-4 p-lg-5 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="text-primary text-7"><i className="fa-solid fa-bullseye"></i></div>
                  <h3 className="heading-font-family text-8 fw-600 mb-0">Our Mission</h3>
                </div>
                <p className="text-body-secondary mb-0">
                  {about?.mission || 'To deliver exceptional hospitality experiences.'}
                </p>
              </div>
            </div>
            <div className="col-lg-6 wow fadeInRight">
              <div className="bg-white rounded-5 p-4 p-lg-5 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="text-primary text-7"><i className="fa-solid fa-eye"></i></div>
                  <h3 className="heading-font-family text-8 fw-600 mb-0">Our Vision</h3>
                </div>
                <p className="text-body-secondary mb-0">
                  {about?.vision || 'To be the most prefer luxury hotel destination.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </> )}