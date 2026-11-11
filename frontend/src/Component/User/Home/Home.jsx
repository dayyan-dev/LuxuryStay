import useHomeTemplateEffects from '../../../hooks/useHomeTemplateEffects';
import Reveal from '../effects/Reveal';
import Intro from './sections/Intro';
import Experience3D from './sections/Experience3D';
import FeaturedHotels from './sections/FeaturedHotels';
import SpecialOffers from './sections/SpecialOffers';
import HomePageRooms from './sections/HomePageRooms';
import DiningHighlight from './sections/DiningHighlight';
import Services from './sections/Services';
import MembershipPrivilege from './sections/MembershipPrivilege';
import Testimonials from './sections/Testimonials';
import AboutHome from './sections/AboutHome';

export default function Home() {
  useHomeTemplateEffects();
  return (
    <div id="content" role="main">
      {/* 1. Hero & Floating Quick Booking Engine */}
      <Intro />

      {/* 2. Presentation 3D visualization stage */}
      <Experience3D />

      {/* 3. Featu LuxuryStay Hotels & Resorts across Pakistan */}
      <FeaturedHotels />

      {/* 4. Special Offers & Seasonal Packages */}
      <Reveal>
        <SpecialOffers />
      </Reveal>

      {/* 4. Heritage & About LuxuryStay */}
      <Reveal>
        <AboutHome />
      </Reveal>

      {/* 5. Rooms & Suites Highlights */}
      <HomePageRooms />

      {/* 6. Signature Dining Experiences */}
      <Reveal>
        <DiningHighlight />
      </Reveal>

      {/* 7. Bespoke Guest Services & Amenities */}
      <Reveal>
        <Services />
      </Reveal>

      {/* 8. Privilege Club Membership */}
      <Reveal>
        <MembershipPrivilege />
      </Reveal>

      {/* 9. Guest Testimonials & Reviews */}
      <Reveal>
        <Testimonials />
      </Reveal>
    </div>
  );
}
