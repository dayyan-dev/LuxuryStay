import { useEffect } from 'react';

const useServicesTemplateEffects = () => {
  useEffect(() => {
    // Jab bhi Services ka page load hoga, screen smoothly top par scroll ho jayegi
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 💡 Future Backend Scope:
    // Agar kal ko aapko Restaurant, Spa aur Banquets ka data database (backend) se lana ho,
    // toh aap fetch/axios ka saara logic isi useEffect ke andar likhenge.
    
  }, []);
};

export default useServicesTemplateEffects;