import { userAsset } from '../../../../utils/userAssets';

const services = [
  { title: 'Massage Therapy', text: 'Relieve tension and restore balance with Swedish, deep tissue, hot stone, or aromatherapy massages.', img: 'images/spa/spa-service-1.jpg', price: 'From $45', time: '60 mins' },
  { title: 'Facials & Skin Care', text: 'Customized treatments to cleanse, hydrate, and rejuvenate your skin using gentle, high-quality products.', img: 'images/spa/spa-service-2.jpg', price: 'From $29', time: '60 mins' },
  { title: 'Body Treatments', text: 'Exfoliating scrubs and nourishing wraps that leave your skin smooth and refreshed.', img: 'images/spa/spa-service-3.jpg', price: 'From $95', time: '120 mins' },
  { title: 'Wellness Add-Ons', text: 'Enhance your visit with scalp treatments, foot rituals, or calming aromatherapy.', img: 'images/spa/spa-service-4.jpg', price: 'From $49', time: '60 mins' },
];

export default function SpaServices() {
  return (
    <section className="section bg-light-1">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Luxury Service
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            Experience Luxurious <span className="text-primary">Spa<br className="d-none d-md-block" /> & Body</span> Care Services
          </h2>
        </div>

        {services.map((item, idx) => (
          <div key={item.title}>
            <div className="row align-items-center gx-lg-5 gy-3">
              <div className="col-md-5 col-lg-6 wow fadeInUp">
                <h3 className="text-5 fw-600">{item.title}</h3>
                <p className="text-3 text-body-secondary mb-0">{item.text}</p>
              </div>

              <div className="col-7 col-md-4 col-lg-3 mx-auto wow fadeInUp" data-wow-delay="0.2s">
                <img className="img-fluid d-flex rounded-5" src={userAsset(item.img)} alt={item.title} />
              </div>

              <div className="col-5 col-md-3 col-xl-2 text-end wow fadeInUp" data-wow-delay="0.4s">
                <div className="text-center border border-dark border-opacity-10 rounded-pill d-inline-block px-4 py-2">
                  <div className="text-2 text-body-tertiary fw-500 lh-sm">{item.time}</div>
                  <div className="fw-600">{item.price}</div>
                </div>
              </div>
            </div>
            {idx < services.length - 1 && <hr className="opacity-1 my-4" />}
          </div>
        ))}
      </div>
    </section>
  );
}