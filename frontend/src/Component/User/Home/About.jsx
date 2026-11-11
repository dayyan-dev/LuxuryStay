import useAboutTemplateEffects from '../../../hooks/useAboutTemplateEffects';
import AboutHero from './sections/AboutHero';
import AboutIntro from './sections/AboutIntro';
import AboutAmenities from './sections/AboutAmenities';
import AboutServices from './sections/AboutServices';
import AboutExperience from './sections/AboutExperience';
import AboutTestimonials from './sections/AboutTestimonials';
import AboutCTA from './sections/AboutCTA';

export default function About() {
  useAboutTemplateEffects();

  return (
    <div id="content" role="main">
      <AboutHero />
      <AboutIntro />
      {/* <AboutAmenities /> */}
      {/* <AboutServices /> */}
      {/* <AboutExperience /> */}
      <AboutTestimonials />
      <AboutCTA />
    </div>
  );
}