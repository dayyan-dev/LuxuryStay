import { Link } from 'react-router-dom';
import { userAsset } from '../../../../utils/userAssets';

export default function Experience() {
  return (
    <section className="hero-wrap section">
      <div className="hero-mask opacity-7 bg-black" />
      <div
        className="hero-bg jarallax"
        style={{ backgroundImage: `url('${userAsset('images/experience-bg.jpg')}')` }}
      />
      <div className="hero-content">
        <div className="container-xxl px-4">
          <div className="row g-5">
            <div className="col-lg-6 text-center wow fadeInLeft">
              <div className="position-relative d-inline-flex">
                <img
                  className="img-fluid rounded-5"
                  src={userAsset('images/experience.jpg')}
                  alt="Our experience"
                />
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
                We have <span className="text-primary">10+ years</span> of experience & we have great memories
              </p>
              <p className="text-light mb-4">
                With years of experience in hospitality, The Mist is committed to delivering exceptional
                service to every guest. Backed by many years of industry expertise, we ensure a comfortable
                and memorable stay for all our guests. With extensive experience in hotel management, we
                provide reliable, high-quality service you can trust.
              </p>
              <p className="mb-4">
                <Link className="btn btn-new btn-primary rounded-pill" to="/contact">
                  <span className="btn-text">
                    <span>Contact Us</span>
                  </span>
                  <span className="btn-icon">
                    <i className="fa-solid fa-arrow-right" />
                  </span>
                </Link>
              </p>
              <div className="row g-4">
                <div className="col-6 col-sm-4">
                  <h3 className="text-11 text-white fw-600 mb-0">95K+</h3>
                  <p className="text-light lh-sm mb-0">Happy Clients</p>
                </div>
                <div className="col-6 col-sm-4">
                  <h3 className="text-11 text-white fw-600 mb-0">800+</h3>
                  <p className="text-light lh-sm mb-0">Functions Arranged</p>
                </div>
                <div className="col-6 col-sm-4">
                  <h3 className="text-11 text-white fw-600 mb-0">32+</h3>
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