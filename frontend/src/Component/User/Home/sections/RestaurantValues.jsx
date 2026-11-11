import React from 'react';

export const RestaurantValues = () => {
  // 1. Saari values ka data ek array me nikal liya
  const valuesData = [
    {
      id: 1,
      icon: "fa-solid fa-medal",
      title: "Quality Food",
      description: "We use fresh ingients and careful preparation to deliver food you can trust and enjoy.",
      delay: "" // Pehle box ke liye koi delay nahi hai
    },
    {
      id: 2,
      icon: "fa-solid fa-bell-concierge",
      title: "Great Service",
      description: "We treat every guest with respect, warmth, and attention.",
      delay: ".2s"
    },
    {
      id: 3,
      icon: "fa-solid fa-repeat",
      title: "Consistency",
      description: "We aim to provide the same quality and experience every time you visit.",
      delay: ".4s"
    },
    {
      id: 4,
      icon: "fa-solid fa-seedling",
      title: "Clean Environment",
      description: "Hygiene and food safety are always our top priorities.",
      delay: ""
    },
    {
      id: 5,
      icon: "fa-solid fa-handshake",
      title: "Honesty & Integrity",
      description: "We operate with transparency, fairness, and respect for our guests and team.",
      delay: ".2s"
    },
    {
      id: 6,
      icon: "fa-solid fa-people-group",
      title: "Community Respect",
      description: "We value our people and strive to contribute positively to our community.",
      delay: ".4s"
    }
  ];

  return (
    <section className="section bg-light-1">
      <div className="container">
        {/* Heading */}
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Our Values
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            The Heart of <br className="d-none d-md-block" />
            <span className="text-primary">Our Restaurant</span>
          </h2>
        </div>

        {/* Values Grid */}
        <div className="row g-4">
          {valuesData.map((value) => (
            <div 
              className="col-md-6 col-lg-4 wow fadeInUp" 
              data-wow-delay={value.delay || undefined} 
              key={value.id}
            >
              <div className="featu-box style-4 bg-white rounded-5 p-4 h-100">
                <div className="featu-box-icon border rounded-5 text-13 shadow-none text-primary mt-3">
                  <i className={value.icon}></i>
                </div>
                <h3 className="text-7 fw-600">{value.title}</h3>
                <p className="text-3 text-body-secondary">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};