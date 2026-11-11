import React from 'react';

// 1. Sahi path se effect wali file (Hook) import ki
import useServicesTemplateEffects from '../../../hooks/useServicesTemplateEffects';

// Section Components Imports
import ServicesHero from './sections/ServicesHero';
import ServicesList from './sections/ServicesList';
import ServicesVideo from './sections/ServicesVideo';
import AvailabilitySection from './sections/AvailabilitySection';

const ServicesPage = () => {
  
  // 2. Hook ko yahan call kar liya (Yeh scroll auto-handle karega)
  useServicesTemplateEffects();

  return (
    <div className="services-page">
      {/* Hero Section */}
      <ServicesHero />

      {/* Main Content Area */}
      <div id="content" role="main">
        {/* Services List (Restaurant, Banquet, Spa) */}
        <ServicesList />

        {/* Promo Video Section */}
        <ServicesVideo />

        {/* Reusable Availability Form Section */}
        {/* <AvailabilitySection /> */}
      </div>
    </div>
  );
};

export default ServicesPage;