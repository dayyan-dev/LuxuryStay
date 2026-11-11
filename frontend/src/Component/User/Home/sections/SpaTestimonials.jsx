import { userAsset } from '../../../../utils/userAssets';

const testimonials = [
  {
    name: 'Dennis Jacques',
    country: 'From Australia',
    img: 'images/testimonial/client-sm-1.jpg',
    text: '“The spa ritual was unforgettable — skilled therapists, serene treatment rooms, and a calm that lasted the rest of my stay. Truly five-star wellness care.”',
  },
  {
    name: 'Patrick Cary',
    country: 'From USA',
    img: 'images/testimonial/client-sm-2.jpg',
    text: '“We hosted our anniversary celebration here, and it was simply perfect. The event team handled every detail flawlessly. Our guests are still talking about how beautiful everything was. It truly felt like a home away from home.”',
  },
  {
    name: 'Sarah Mitchell',
    country: 'From Spain',
    img: 'images/testimonial/client-sm-3.jpg',
    text: '“We traveled as a family and couldn’t have asked for a better place to stay. The staff was incibly kind, the amenities were perfect for both adults and kids, and we felt right at home the entire time.”',
  },
  {
    name: 'Olivia Bennett',
    country: 'From United Kingdom',
    img: 'images/testimonial/client-sm-4.jpg',
    text: '“As a frequent business traveler, I appreciate efficiency and comfort — and this hotel delivers both flawlessly. Fast check-in, reliable Wi-Fi, and a peaceful atmosphere made my trip productive and stress-free.”',
  },
];

export default function SpaTestimonials() {
  return (
    <section className="section bg-light-1">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Our Testimonials
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            What Our <span className="text-primary">Guests Says<br className="d-none d-md-block" /> About</span> Spa Experience
          </h2>
        </div>

        <div className="swiper wow fadeInUp" data-loop="true" data-autoplay="true" data-margin="30" data-items-xs="1" data-items-sm="1" data-items-md="1" data-items-lg="2">
          <div className="swiper-wrapper">
            {testimonials.map((item) => (
              <div className="swiper-slide" key={item.name}>
                <div className="bg-white rounded-5 p-5">
                  <p className="lh-lg">{item.text}</p>
                  <div className="d-flex align-items-center gap-3">
                    <img className="rounded-circle w-auto" src={userAsset(item.img)} alt={item.name} />
                    <div>
                      <h3 className="text-4 fw-600 mb-1">{item.name}</h3>
                      <div className="text-3 fw-500 text-body-tertiary">{item.country}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ls-swiper-controls">
            <div className="swiper-button-prev ls-swiper-nav" role="button" aria-label="Previous review">
              <i className="fa-solid fa-angle-left" aria-hidden="true"></i>
            </div>
            <div className="swiper-pagination position-relative" style={{ width: 'auto' }}></div>
            <div className="swiper-button-next ls-swiper-nav" role="button" aria-label="Next review">
              <i className="fa-solid fa-angle-right" aria-hidden="true"></i>
            </div>
          </div>
        </div>

        <div className="fw-500 text-center mt-4 wow fadeInUp">
          Prefer dining or spa feedback?{' '}
          <a href="/contact" className="fw-600 link-primary link-offset-2 link-underline-opacity-100 link-underline-opacity-0-hover">
            Share with Guest Relations
          </a>
        </div>
      </div>
    </section>
  );
}