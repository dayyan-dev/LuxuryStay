import { useEffect } from 'react';

export default function useFaqTemplateEffects() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof window.WOW !== 'undefined') {
      new window.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: true,
        live: true,
      }).init();
    }
  }, []);
}