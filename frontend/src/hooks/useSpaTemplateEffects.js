import { useEffect } from 'react';

function initLightbox(root) {
  if (typeof window.GLightbox !== 'undefined') {
    window.GLightbox({ selector: '.glightbox' });
  }
}

function initSwiper(root) {
  if (typeof window.Swiper === 'undefined') return;
  root.querySelectorAll('.swiper').forEach((el) => {
    if (el.swiper) return;
    const data = el.dataset;
    new window.Swiper(el, {
      loop: data.loop === 'true',
      slidesPerView: 1,
      spaceBetween: data.margin ? parseInt(data.margin, 10) : 30,
      autoplay: data.autoplay === 'true' ? { delay: 5000, disableOnInteraction: false } : false,
      navigation: {
        nextEl: el.querySelector('.swiper-button-next'),
        prevEl: el.querySelector('.swiper-button-prev'),
      },
      pagination: {
        el: el.querySelector('.swiper-pagination'),
        clickable: true,
      },
      breakpoints: {
        0: { slidesPerView: parseInt(data.itemsXs, 10) || 1 },
        576: { slidesPerView: parseInt(data.itemsSm, 10) || 1 },
        768: { slidesPerView: parseInt(data.itemsMd, 10) || 1 },
        992: { slidesPerView: parseInt(data.itemsLg, 10) || 2 },
      },
    });
  });
}

export default function useSpaTemplateEffects() {
  useEffect(() => {
    const root = document.getElementById('content');
    if (!root) return;

    if (typeof window.jarallax !== 'undefined') {
      window.jarallax(root.querySelectorAll('.jarallax'), { speed: 0.2 });
    }

    if (typeof window.WOW !== 'undefined') {
      new window.WOW({ boxClass: 'wow', animateClass: 'animated', offset: 0, mobile: true, live: true }).init();
    }

    initSwiper(root);
    initLightbox(root);
  }, []);
}