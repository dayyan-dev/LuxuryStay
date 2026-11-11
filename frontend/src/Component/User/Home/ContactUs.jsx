import useContactTemplateEffects from '../../../hooks/useContactTemplateEffects';
import React from 'react';
import ContactHero from './sections/ContactHero';
import ContactInfo from './sections/ContactInfo';
import ContactFormSection from './sections/ContactFormSection';
import ContactMap from './sections/ContactMap';

import AvailabilitySection from './sections/AvailabilitySection';

export default function ContactUs() {
  useContactTemplateEffects();
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div id="content" role="main">
      <ContactHero />
      {/* <ContactInfo /> */}
      <ContactFormSection />
      {/* <ContactMap /> */}
    </div>
  );
}