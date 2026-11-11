import { Link } from 'react-router-dom';

export default function AboutAmenities() {
    const items = [
      ['fa-car', 'Pick Up & Drop', 'Free pick up from the railway station and air port or bus stand. Well-maintained vehicles and professional drivers ensure seamless travel for guests.'],
      ['fa-wifi', 'High Speed Wifi', 'Enjoy seamless connectivity high-speed Wi-Fi, available in all guest rooms and public areas. our network ensures fast, stable, and secure internet access at all times.'],
      ['fa-charging-station', 'EV Charger', 'We provide convenient on-site EV charging services for our eco-conscious guests. Our fast and reliable chargers are compatible with all major electric vehicle models..'],
      ['fa-shirt', 'Laundry', 'Enjoy the convenience of our professional laundry service. our efficient and reliable service ensures your clothes are cleaned and pressed promptly.'],
      ['fa-water-ladder', 'Swimming Pool', 'Dive into relaxation at our pristine swimming pool, designed for leisure, fitness, and fun. Whether you want to unwind under the sun, take a refreshing dip, or enjoy a few lap.'],
      ['fa-utensils', 'Bar & Restaurant', 'Enjoy exceptional dining and refreshing drinks at our hotel bar and restaurant. Gourmet meals, expertly mixed cocktails, and fine wines made with fresh, locally sourced ingients.'],
    ];
  
    return (
      <section className="section bg-light-1">
        <div className="container">
          <div className="mx-auto text-center mb-5">
            <p className="wow fadeInUp">
              <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
                Hotel Amenities
              </span>
            </p>
            <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
              Our Premium, <span className="text-primary">Industry <br className="d-none d-md-block" />Leading</span> Facilities
            </h2>
          </div>
  
          <div className="row g-4">
            {items.map(([icon, title, text], idx) => (
              <div className="col-md-6 col-lg-4" key={title}>
                <div className="featu-box style-4 bg-white rounded-5 p-4 h-100 wow fadeInUp" data-wow-delay={idx ? '.2s' : undefined}>
                  <div className="featu-box-icon border rounded-5 text-13 shadow-none text-primary mt-3">
                    <i className={`fa-solid ${icon}`}></i>
                  </div>
                  <h3 className="text-7 fw-600">{title}</h3>
                  <p className="text-3 text-body-secondary">{text}</p>
                </div>
              </div>
            ))}
          </div>
  
          <div className="text-center mt-5 wow fadeInUp">
            <Link className="btn btn-new btn-primary rounded-pill" to="/services">
              <span className="btn-text"><span>View all Amenities</span></span>
              <span className="btn-icon"><i className="fa-solid fa-arrow-right"></i></span>
            </Link>
          </div>
        </div>
      </section>
    );
  }