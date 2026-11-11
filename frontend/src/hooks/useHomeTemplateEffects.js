import { useEffect } from 'react';

function initSwipers(root) {
  if (typeof window.Swiper === 'undefined') return;

  root.querySelectorAll('.swiper').forEach((el) => {
    if (el.swiper) return;

    const data = el.dataset;
    const swiperOptions = {
      loop: data.loop === 'true',
      slidesPerView: 1,
      effect: data.effect || 'slide',
      spaceBetween: data.margin ? parseInt(data.margin, 10) : 30,
      speed: parseInt(data.speed, 10) || 400,
      autoplay:
        data.autoplay === 'true'
          ? { delay: parseInt(data.delay, 10) || 5000, disableOnInteraction: false }
          : false,
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
        768: { slidesPerView: parseInt(data.itemsMd, 10) || 2 },
        992: { slidesPerView: parseInt(data.itemsLg, 10) || 2 },
      },
    };

    if (data.effect === 'fade') {
      swiperOptions.fadeEffect = { crossFade: true };
    }

    // eslint-disable-next-line no-new
    new window.Swiper(el, swiperOptions);
  });
}

function initDatePickers(checkInSelector, checkOutSelector) {
  const $ = window.jQuery;
  if (!$ || typeof $.fn.daterangepicker === 'undefined' || typeof window.moment === 'undefined') {
    return;
  }

  const checkIn = $(checkInSelector);
  const checkOut = $(checkOutSelector);
  if (!checkIn.length || !checkOut.length) return;

  if (checkIn.data('daterangepicker')) checkIn.data('daterangepicker').remove();
  if (checkOut.data('daterangepicker')) checkOut.data('daterangepicker').remove();

  checkIn.daterangepicker(
    {
      singleDatePicker: true,
      autoApply: true,
      minDate: window.moment(),
      autoUpdateInput: false,
    },
    (start) => {
      checkIn.val(start.format('MM-DD-YYYY'));
      const picker = checkOut.data('daterangepicker');
      if (picker) {
        picker.setStartDate(start);
        picker.minDate = start;
      }
      checkOut.val(start.format('MM-DD-YYYY'));
    }
  );

  checkOut.daterangepicker(
    {
      singleDatePicker: true,
      autoApply: true,
      minDate: window.moment(),
      autoUpdateInput: false,
    },
    (end) => {
      checkOut.val(end.format('MM-DD-YYYY'));
    }
  );
}

export default function useHomeTemplateEffects() {
  useEffect(() => {
    const root = document.getElementById('content');
    if (!root) return;

    initSwipers(root);

    if (typeof window.jarallax !== 'undefined') {
      window.jarallax(root.querySelectorAll('.jarallax'), { speed: 0.2 });
    }

    if (typeof window.WOW !== 'undefined') {
      new window.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: true,
        live: true,
      }).init();
    }

    if (typeof window.GLightbox !== 'undefined') {
      window.GLightbox({ selector: '#content .glightbox' });
    }

    const $ = window.jQuery;
    if ($) {
      initDatePickers('#searchCheckIn', '#searchCheckOut');
      initDatePickers('#hotelsCheckIn', '#hotelsCheckOut');
    }
  }, []);
}
