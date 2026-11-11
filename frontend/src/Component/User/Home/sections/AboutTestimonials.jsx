import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function AboutTestimonials() {
  const [feedbacks, setFeedbacks] = useState([]);
  const swiperRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/feedbacks/public`)
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data.filter((f) => f.review && !String(f.review).startsWith('[Guest Inquiry]'))
          : [];
        setFeedbacks(list);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!feedbacks.length || !swiperRef.current) return;
    if (typeof window === 'undefined' || typeof window.Swiper === 'undefined') return;

    if (instanceRef.current) {
      instanceRef.current.destroy(true, true);
      instanceRef.current = null;
    }

    instanceRef.current = new window.Swiper(swiperRef.current, {
      loop: feedbacks.length > 1,
      slidesPerView: 1,
      spaceBetween: 24,
      speed: 450,
      autoplay:
        feedbacks.length > 1
          ? { delay: 5500, disableOnInteraction: false }
          : false,
      navigation: {
        nextEl: swiperRef.current.querySelector('.swiper-button-next'),
        prevEl: swiperRef.current.querySelector('.swiper-button-prev'),
      },
      pagination: {
        el: swiperRef.current.querySelector('.swiper-pagination'),
        clickable: true,
      },
      breakpoints: {
        992: { slidesPerView: Math.min(2, feedbacks.length) },
      },
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy(true, true);
        instanceRef.current = null;
      }
    };
  }, [feedbacks]);

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`fa-star ${i < rating ? 'fa-solid text-warning' : 'fa-regular text-muted'}`}
        style={{ fontSize: 14 }}
      />
    ));

  if (feedbacks.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto text-center mb-5">
          <p className="wow fadeInUp">
            <span className="text-3 text-uppercase fw-600 rounded-pill border border-dark border-opacity-10 px-3 py-1">
              Guest Reviews
            </span>
          </p>
          <h2 className="heading-font-family text-13 fw-600 lh-sm wow fadeInUp" data-wow-delay=".2s">
            What Our <span className="text-primary">Guests Say <br className="d-none d-md-block" />About</span> Their Stay
          </h2>
        </div>

        <div className="swiper wow fadeInUp" ref={swiperRef}>
          <div className="swiper-wrapper">
            {feedbacks.map((item) => (
              <div className="swiper-slide" key={item._id}>
                <div className="bg-white rounded-5 p-5 h-100">
                  <div className="mb-2">{renderStars(item.rating)}</div>
                  <p className="lh-lg">"{item.review}"</p>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                      style={{
                        width: 50,
                        height: 50,
                        fontSize: 20,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-4 fw-600 mb-1">{item.name}</h3>
                      <div className="text-3 fw-500 text-body-tertiary">
                        {new Date(item.createdAt).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ls-swiper-controls">
            <div
              className="swiper-button-prev ls-swiper-nav"
              role="button"
              aria-label="Previous review"
            >
              <i className="fa-solid fa-angle-left" aria-hidden="true"></i>
            </div>
            <div className="swiper-pagination position-relative" style={{ width: 'auto' }} />
            <div
              className="swiper-button-next ls-swiper-nav"
              role="button"
              aria-label="Next review"
            >
              <i className="fa-solid fa-angle-right" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
