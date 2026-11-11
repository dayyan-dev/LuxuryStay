import { userAsset } from '../../../../utils/userAssets';


export default function AvailabilitySection() {
    return (
      <section className="section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 align-content-center wow fadeInLeft">
              <p>
                <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
                  Plan Your Stay
                </span>
              </p>
              <h2 className="heading-font-family text-13 fw-600 lh-sm mb-4">
                Embark on <span className="text-primary">Your Bespoke</span> Experience
              </h2>
              <p className="text-body-secondary mb-4">
                Discover your perfect retreat. Select your dates, choose your suite, and secure your exclusive experience at The Mist luxury hotel.
              </p>
              <div className="d-inline-flex align-items-center gap-4">
                <div className="d-flex align-items-center gap-3 ms-sm-2 h-100">
                  <div className="text-primary text-7 d-inline-flex"><i className="fa-solid fa-phone-volume"></i></div>
                  <div className="vr my-1 opacity-1"></div>
                  <div className="text-start">
                    <div className="text-2 fw-600 text-body-tertiary mb-1">Call us for Inquiry:</div>
                    <h3 className="text-4 fw-700 mb-0">(+060) 444 5346</h3>
                  </div>
                </div>
              </div>
            </div>
  
            <div className="col-lg-6 wow fadeInRight">
              <div className="bg-white rounded-5 px-4 px-sm-5 py-5">
                <h3 className="text-8 fw-600 mb-4">Check <span className="text-primary">Availability</span></h3>
                <form id="searchHotels" method="post">
                  <div className="row gy-4 gx-3">
                    <div className="col-12">
                      <label className="form-label text-3 fw-600" htmlFor="searchCheckIn">Check In:</label>
                      <div className="position-relative">
                        <input id="searchCheckIn" type="text" className="form-control rounded-pill" required placeholder="Check In" />
                        <span className="icon-inside"><i className="fa-regular fa-calendar-alt"></i></span>
                      </div>
                    </div>
  
                    <div className="col-12">
                      <label className="form-label text-3 fw-600" htmlFor="searchCheckOut">Check Out:</label>
                      <div className="position-relative">
                        <input id="searchCheckOut" type="text" className="form-control rounded-pill" required placeholder="Check Out" />
                        <span className="icon-inside"><i className="fa-regular fa-calendar-alt"></i></span>
                      </div>
                    </div>
  
                    <div className="col-md-6 col-lg">
                      <label className="form-label text-3 fw-600" htmlFor="searchAdults">Adults:</label>
                      <select id="searchAdults" className="form-select rounded-pill h-100" required>
                        <option value="">Adults</option>
                        <option>1 Adult</option>
                        <option>2 Adults</option>
                        <option>3 Adults</option>
                        <option>4 Adults</option>
                      </select>
                    </div>
  
                    <div className="col-md-6 col-lg">
                      <label className="form-label text-3 fw-600" htmlFor="searchChild">Children:</label>
                      <select id="searchChild" className="form-select rounded-pill h-100" required>
                        <option value="">Children</option>
                        <option>1 Child</option>
                        <option>2 Children</option>
                        <option>3 Children</option>
                        <option>4 Children</option>
                      </select>
                    </div>
  
                    <div className="col-12">
                      <label className="form-label text-3 fw-600" htmlFor="searchRoom">Select Room:</label>
                      <select id="searchRoom" className="form-select rounded-pill h-100" required>
                        <option value="">Select Room</option>
                        <option>1 Room</option>
                        <option>2 Rooms</option>
                        <option>3 Rooms</option>
                        <option>4 Rooms</option>
                        <option>5 Rooms</option>
                      </select>
                    </div>
  
                    <div className="col-12 d-grid">
                      <button className="btn btn-new btn-primary rounded-pill" type="submit">
                        <span className="btn-text"><span>Check Availability</span></span>
                        <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }