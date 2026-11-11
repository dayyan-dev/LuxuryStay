import { userAsset } from '../../../../utils/userAssets';

export default function SpaAbout() {
  return (
    <section className="section">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-6 text-center wow fadeInLeft">
            <div className="position-relative d-inline-flex">
              <img className="img-fluid rounded-5" src={userAsset('images/spa/spa-about.jpg')} alt="Spa About" />

              <div className="position-absolute bottom-0 end-0 mb-5 me-5">
                <div className="circle-text bg-white border border-2 border-primary wow bounceIn" data-wow-delay="0.3s">
                  <svg viewBox="0 0 500 500">
                    <defs>
                      <path id="circlePath" d="M50,250c0-110.5,89.5-200,200-200s200,89.5,200,200s-89.5,200-200,200S50,360.5,50,250"></path>
                    </defs>
                    <text className="text-uppercase fw-700 ls-7">
                      <textPath xlinkHref="#circlePath">Relax ✦ Renew ✦ Restore ✦</textPath>
                    </text>
                  </svg>
                  <div className="circle-icon text-bg-primary translate-middle">
                    <i className="fa-solid fa-spa"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 wow fadeInRight">
            <p>
              <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
                About Spa Center
              </span>
            </p>
            <h2 className="heading-font-family text-13 fw-600 lh-sm mb-4">
              Experience <span className="text-primary">total relaxation</span> with personalized <span className="text-primary">spa</span>
            </h2>

            <p className="text-5 text-body-secondary">
              Welcome to The Mist Spa, a peaceful retreat where stress fades and wellness begins.
            </p>
            <p className="text-body-secondary mb-4">
              Our experienced therapists combine natural products with proven techniques to help you relax, recharge, and feel your best—inside and out. Whether you’re visiting for a quick refresh or a full day of self-care, every detail is designed around your comfort.
            </p>

            <div className="row mt-5">
              <div className="col-sm-5 wow fadeInUp">
                <div className="mb-3">
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Mon-Fri:</div>
                  <div className="fw-700">10.30am – 8.30pm</div>
                </div>
                <div className="mb-3">
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Sat-Sun:</div>
                  <div className="fw-700">8.30am – 10.30pm</div>
                </div>
              </div>

              <div className="col-sm-auto align-content-center wow fadeInUp" data-wow-delay=".2s">
                <div className="bg-white rounded-4 p-3 d-flex align-items-center gap-3">
                  <div className="text-primary text-7 d-inline-flex"><i className="fa-solid fa-phone-volume"></i></div>
                  <div className="vr my-1 opacity-1"></div>
                  <div className="text-start">
                    <div className="text-2 fw-600 text-body-tertiary mb-1">Call for Inquiry:</div>
                    <h3 className="text-4 fw-700 mb-0">(+060) 444 5346</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}