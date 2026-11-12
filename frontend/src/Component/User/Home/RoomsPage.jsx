import React from 'react';

// Backend wala hook import kiya
import useRoomsTemplateEffects from '../../../hooks/useRoomsTemplateEffects';


// Sections Imports
import RoomsHero from './sections/RoomsHero'; 
import RoomsList from './sections/RoomsList'; 
import GuestFeedbackSection from './sections/GuestFeedbackSection';
import HomeAmenities from './sections/HomeAmenities';
import AvailabilitySection from './sections/AvailabilitySection';

const RoomsPage = () => {
  
  // 1. Backend se rooms ka data, loading aur error state nikali
  const { rooms, loading, error } = useRoomsTemplateEffects();

  return (
    <div className="rooms-page">
      {/* 1. Hero Section */}
      <RoomsHero />

      {/* Main Content Area */}
      <div id="content" role="main">
        
        {/* 2. Rooms List Section (Yahan data aur loading props bhej diye hain) */}
        {error ? (
          <div className="error-message" style={{ color: '', padding: '20px', textAlign: 'center' }}>
            <p>{error}</p>
          </div>
        ) : (
          <RoomsList rooms={rooms} loading={loading} />
        )}

        {/* 3. Verified Guest Reviews & Leave Feedback Section */}
        <GuestFeedbackSection rooms={rooms} />
       
      </div>
    </div>
  );
};

export default RoomsPage;