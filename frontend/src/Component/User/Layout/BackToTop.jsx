import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      id="back-to-top"
      type="button"
      className={visible ? 'show' : ''}
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      title="Scroll to top"
      style={{
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      <i className="fa-solid fa-arrow-up" />
    </button>
  );
}