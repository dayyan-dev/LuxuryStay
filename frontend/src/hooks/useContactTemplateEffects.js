import { useEffect } from 'react';

export default function useContactTemplateEffects() {
  useEffect(() => {
    const root = document.getElementById('content');
    if (!root) return;

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
    if ($ && typeof $.fn.daterangepicker !== 'undefined' && typeof window.moment !== 'undefined') {
      const checkIn = $('#searchCheckIn');
      const checkOut = $('#searchCheckOut');

      if (checkIn.length && checkOut.length) {
        checkIn.daterangepicker({
          singleDatePicker: true,
          autoApply: true,
          minDate: window.moment(),
          autoUpdateInput: false,
        }, (start) => {
          checkIn.val(start.format('MM-DD-YYYY'));
          const picker = checkOut.data('daterangepicker');
          if (picker) {
            picker.setStartDate(start);
            picker.minDate = start;
          }
          checkOut.val(start.format('MM-DD-YYYY'));
        });

        checkOut.daterangepicker({
          singleDatePicker: true,
          autoApply: true,
          minDate: window.moment(),
          autoUpdateInput: false,
        }, (end) => {
          checkOut.val(end.format('MM-DD-YYYY'));
        });
      }
    }
  }, []);
}