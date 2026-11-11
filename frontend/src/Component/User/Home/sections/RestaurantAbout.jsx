import React from 'react';
import { userAsset } from '../../../../utils/userAssets';

const RestaurantAbout = () => {
  return (
    <section className="section">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-6 wow fadeInLeft">
            <p>
              <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
                Meal with us
              </span>
            </p>
            <h2 className="heading-font-family text-13 fw-600 lh-sm mb-4">
              A Hotel <span className="text-primary">Restaurant</span> Serves Meals to Both <span className="text-primary">Guests</span> and <span className="text-primary">Visitors</span>
            </h2>
            
            <p className="text-5 text-body-secondary">
              The Mist introduces guests to a memorable experience in dining out, fast becoming a prefer choice in dining out.
            </p>
            <p className="text-body-secondary mb-4">
              The Mist offers a choice of dining options available to our guests with a zest for the good life. Unwind at our wellness center or explore nearby attractions easily.
            </p>

            <div className="row mt-5">
              <div className="col-sm-5 wow fadeInUp">
                <div className="mb-3">
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Breakfast:</div>
                  <div className="fw-700">7.00am – 10.30am</div>
                </div>
                <div className="mb-3">
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Lunch:</div>
                  <div className="fw-700">11.00am – 3.00pm</div>
                </div>
                <div className="mb-3">
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Dinner:</div>
                  <div className="fw-700">7.00pm – 11.00pm</div>
                </div>
              </div>
              <div className="col-sm-auto align-content-center wow fadeInUp" data-wow-delay="0.2s">
                <div className="bg-white rounded-4 p-3 d-flex align-items-center gap-3">
                  <div className="text-primary text-7 d-inline-flex"><i className="fa-solid fa-phone-volume"></i></div>
                  <div className="vr my-1 opacity-1"></div>
                  <div className="text-start">
                    <div className="text-2 fw-600 text-body-tertiary mb-1">Call for Reservation:</div>
                    <h3 className="text-4 fw-700 mb-0">(+060) 444 5346</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 wow fadeInRight">
            <div className="position-relative text-center d-flex flex-column gap-4">
              <div className="d-inline-flex">
                <img className="img-fluid rounded-5" src={userAsset('images/restaurant/restaurant-about.jpg')} alt="About Restaurant" />
              </div>
              <div className="d-inline-flex">
                <img className="img-fluid rounded-5" src={userAsset('images/restaurant/restaurant-about-2.jpg')} alt="Interior" />
              </div>
              
              <div className="position-absolute top-50 start-50 translate-middle">
                <div className="circle-text bg-white border border-2 border-primary wow bounceIn" data-wow-delay="0.2s">
                  <svg viewBox="0 0 500 500">
                    <defs>
                      <path id="circlePath" d="M50,250c0-110.5,89.5-200,200-200s200,89.5,200,200s-89.5,200-200,200S50,360.5,50,250"></path>
                    </defs>
                    <text className="text-uppercase fw-700 ls-9">
                      <textPath xlinkHref="#circlePath">Feel Fuller ✦ Eat Better ✦</textPath>
                    </text>
                  </svg>
                  <div className="circle-icon text-bg-primary translate-middle"><i className="fa-solid fa-utensils"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantAbout;