import useFaqTemplateEffects from '../../../hooks/useFaqTemplateEffects';

import FaqHero from './sections/FaqHero';
import FaqAccordion from './sections/FaqAccordion';

import AvailabilitySection from './sections/AvailabilitySection';

export default function Faq() {
  useFaqTemplateEffects();

  return (
    <div id="content" role="main">
      <FaqHero />
      <FaqAccordion />
      {/* <AvailabilitySection /> */}
    </div>
  );
}