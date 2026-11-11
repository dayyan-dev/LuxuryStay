import { Link } from 'react-router-dom';
import { userAsset } from '../../../../utils/userAssets';

export default function AboutServices() {
  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Services
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            We provide <span className="text-primary">Top Class <br className="d-none d-md-block" />Facility</span> for You
          </h2>
        </div>

        <div className="row gx-5 gy-4 gy-lg-5 mb-5">
          <div className="col-lg-6 text-center wow fadeInLeft">
            <img className="img-fluid rounded-5" src={userAsset('images/restaurant/restaurant-about.jpg')} alt="Restaurant" />
          </div>
          <div className="col-lg-6 align-content-center wow fadeInRight">
            <p><span className="d-inline-flex text-2 text-uppercase fw-500 rounded-pill border border-dark border-opacity-10 px-3">Meal With Us</span></p>
            <h3 className="heading-font-family text-8 fw-600">The Restaurant</h3>
            <p className="text-3 text-body-secondary">
              The Mist introduces guests to a memorable experience in dining out, fast becoming a prefer choice in dining out, The Mist offers a choice of dining options available to our guests with a zest for the good life.
            </p>
            <Link className="btn btn-new btn-primary rounded-pill" to="/restaurant">
              <span className="btn-text"><span>Read More</span></span>
              <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
            </Link>
          </div>
        </div>

        <div className="row gx-5 gy-4 gy-lg-5 mb-5">
          <div className="col-lg-6 align-content-center order-2 order-lg-1 wow fadeInLeft">
            <p><span className="d-inline-flex text-2 text-uppercase fw-500 rounded-pill border border-dark border-opacity-10 px-3">We Find Happiness</span></p>
            <h3 className="heading-font-family text-8 fw-600 mb-3">Banquet Hall</h3>
            <p className="text-3 text-body-secondary">
              The Mist offers a choice of banqueting venues, with extensive facilities for wedding functions, social gatherings, parties, conferences, and seminars to suit all needs. From booking inquiries to the finale.
            </p>
            <Link className="btn btn-new btn-primary rounded-pill" to="/services">
              <span className="btn-text"><span>Read More</span></span>
              <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
            </Link>
          </div>
          <div className="col-lg-6 text-center order-1 order-lg-2 wow fadeInRight">
            <img className="img-fluid rounded-5" src={userAsset('images/banquets/banquets.jpg')} alt="Banquet Hall" />
          </div>
        </div>

        <div className="row gx-5 gy-4 gy-lg-5">
          <div className="col-lg-6 text-center wow fadeInLeft">
            <img className="img-fluid rounded-5" src={userAsset('images/spa/spa.jpg')} alt="Spa" />
          </div>
          <div className="col-lg-6 align-content-center wow fadeInRight">
            <p><span className="d-inline-flex text-2 text-uppercase fw-500 rounded-pill border border-dark border-opacity-10 px-3">Stay in great shape</span></p>
            <h3 className="heading-font-family text-8 fw-600 mb-3">Spa</h3>
            <p className="text-3 text-body-secondary">
              Welcome to holistic rejuvenation through relaxing regimens with our natural range of treatments. Each spa experience is customised to recharge and refresh you both physically and mentally and to bring out your inner radiance.
            </p>
            <Link className="btn btn-new btn-primary rounded-pill" to="/services">
              <span className="btn-text"><span>Read More</span></span>
              <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}