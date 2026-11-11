import { userAsset } from '../../../../utils/userAssets';

export default function ContactInfo() {
    return (
      <div className="section">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3 wow fadeInUp">
                <div className="text-primary text-7"><i className="fa-solid fa-phone-volume"></i></div>
                <div className="vr my-1 opacity-1"></div>
                <div>
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Call us for Inquiry:</div>
                  <div className="text-4 fw-700 text-dark mb-0">(+060) 444 5346</div>
                </div>
              </div>
            </div>
  
            <div className="col-md-6 col-lg-4">
              <div className="d-flex gap-3 wow fadeInUp" data-wow-delay=".2s">
                <div className="text-primary text-7"><i className="fa-solid fa-envelope"></i></div>
                <div className="vr my-1 opacity-1"></div>
                <div>
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Email Address:</div>
                  <div className="text-4 fw-700 text-dark mb-0">info@theLuxuryStay.com</div>
                </div>
              </div>
            </div>
  
            <div className="col-lg-4">
              <div className="d-flex gap-3 wow fadeInUp" data-wow-delay=".4s">
                <div className="text-primary text-7"><i className="fa-solid fa-location-dot"></i></div>
                <div className="vr my-1 opacity-1"></div>
                <div>
                  <div className="text-2 fw-600 text-body-tertiary mb-1">Address:</div>
                  <div className="text-4 fw-600 text-dark lh-base mb-0">
                    423 W 9th St, Los Angeles, CA 90014, United States
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }