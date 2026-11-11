import { Link } from 'react-router-dom';

const amenities = [
  { icon: 'fa-car', title: 'Pick Up & Drop', text: 'Free pick up from the railway station and air port or bus stand. Well-maintained vehicles and professional drivers ensure seamless travel for guests.' },
  { icon: 'fa-wifi', title: 'High Speed Wifi', text: 'Enjoy seamless connectivity high-speed Wi-Fi, available in all guest rooms and public areas. our network ensures fast, stable, and secure internet access at all times.', delay: '.2s' },
  { icon: 'fa-charging-station', title: 'EV Charger', text: 'We provide convenient on-site EV charging services for our eco-conscious guests. Our fast and reliable chargers are compatible with all major electric vehicle models..', delay: '.4s' },
  { icon: 'fa-shirt', title: 'Laundry', text: 'Enjoy the convenience of our professional laundry service. our efficient and reliable service ensures your clothes are cleaned and pressed promptly.' },
  { icon: 'fa-water-ladder', title: 'Swimming Pool', text: 'Dive into relaxation at our pristine swimming pool, designed for leisure, fitness, and fun. Whether you want to unwind under the sun, take a refreshing dip, or enjoy a few lap.', delay: '.2s' },
  { icon: 'fa-utensils', title: 'Bar & Restaurant', text: 'Enjoy exceptional dining and refreshing drinks at our hotel bar and restaurant. Gourmet meals, expertly mixed cocktails, and fine wines made with fresh, locally sourced ingients.', delay: '.2s' },
];

export default function HomeAmenities() {
  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Hotel Amenities
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            Our Premium, <span className="text-primary">Industry <br className="d-none d-md-block" />Leading</span>{' '}
            Facilities
          </h2>
        </div>

        <div className="row g-4">
          {amenities.map((item) => (
            <div key={item.title} className="col-md-6 col-lg-4">
              <div
                className="featu-box style-4 bg-white rounded-5 p-4 h-100 wow fadeInUp"
                data-wow-delay={item.delay}
              >
                <div className="featu-box-icon border rounded-5 text-13 shadow-none text-primary mt-3">
                  <i className={`fa-solid ${item.icon}`} />
                </div>
                <h3 className="text-7 fw-600">{item.title}</h3>
                <p className="text-3 text-body-secondary">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-5 wow fadeInUp">
          <Link className="btn btn-new btn-primary rounded-pill" to="/services">
            <span className="btn-text">
              <span>View all Amenities</span>
            </span>
            <span className="btn-icon">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
