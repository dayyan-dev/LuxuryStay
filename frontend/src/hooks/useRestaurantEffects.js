import { useEffect } from 'react';

const useRestaurantEffects = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Future integration: Fetch current menu dynamically from backend
  }, []);
};

export default useRestaurantEffects;