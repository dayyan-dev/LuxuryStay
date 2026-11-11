const items = [
  { icon: 'fa-user-tie', title: 'Expert Therapists', text: 'Our certified professionals are trained in the latest wellness techniques to ensure safe, and deeply relaxing treatments.' },
  { icon: 'fa-cannabis', title: 'Premium Natural Products', text: 'We use high-quality, skin-friendly products made from natural ingients for visible results and total peace of mind.' },
  { icon: 'fa-globe', title: 'Tranquil Atmosphere', text: 'Step into a calm, luxurious space designed to help you disconnect from stress and reconnect with yourself.' },
  { icon: 'fa-person-shelter', title: 'Personalized Treatments', text: 'No two bodies are the same. Every session is customized to match your wellness goals, preferences, and comfort level.' },
  { icon: 'fa-user-shield', title: 'Hygiene & Safety First', text: 'We maintain the highest standards of cleanliness, sanitation, and client care at all times.' },
  { icon: 'fa-spa', title: 'Holistic Wellness Approach', text: 'We focus on total well-being—mind, body, and soul—combining relaxation with long-term health benefits.' },
];

export default function SpaWhyChoose() {
  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Why Choose Us
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            Where <span className="text-primary">Luxury<br className="d-none d-md-block" /> Meets</span> Wellness
          </h2>
        </div>

        <div className="brands-grid separator-border">
          <div className="row gx-5">
            {items.map((item, idx) => (
              <div className="col-md-6 col-lg-4 py-4 wow fadeInUp" data-wow-delay={idx % 2 === 1 ? '.2s' : idx > 1 ? '.4s' : undefined} key={item.title}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="featu-box-icon border rounded-4 text-8 shadow-none text-primary px-2 py-1">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h3 className="text-5 fw-600 mb-0">{item.title}</h3>
                </div>
                <p className="text-3 text-body-secondary mb-0">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}