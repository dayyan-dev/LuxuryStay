import { Link } from 'react-router-dom';
import Reveal from '../../effects/Reveal';
import TiltCard from '../../effects/TiltCard';

const PANELS = [
  {
    title: 'Presidential Suite',
    caption: '360° spatial preview · marble & gold accents',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80',
    to: '/room?type=suite',
  },
  {
    title: 'Ocean Cliff Villa',
    caption: 'Immersive depth · Gwadar coastline light',
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900&q=80',
    to: '/hotels?city=Gwadar',
  },
  {
    title: 'Alpine Summit Lounge',
    caption: 'Parallax layers · Bhurban pine vistas',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&q=80',
    to: '/hotels?city=Bhurban',
  },
];

export default function Experience3D() {
  return (
    <section
      className="py-5"
      style={{
        background:
          'linear-gradient(165deg, var(--theme-sidebar, #0F172A) 0%, #141B2D 48%, var(--theme-sidebar, #0F172A) 100%)',
        borderTop: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.25))',
        borderBottom: '1px solid var(--theme-primary-soft, rgba(27, 54, 93, 0.25))',
        overflow: 'hidden',
      }}
    >
      <div className="container py-4">
        <Reveal className="text-center mb-5">
          <span className="ls-3d-badge mb-3">
            <i className="fa-solid fa-cube"></i> 3D Visualization
          </span>
          <h2
            className="ls-section-title text-white mb-2"
            style={{ color: '#fff' }}
          >
            Step Inside the Experience
          </h2>
          <p
            className="ls-section-subtitle"
            style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 620 }}
          >
            Move your cursor over each suite — live 3D tilt, depth layers, and
            cinematic lighting built for LuxuryStay presentations.
          </p>
        </Reveal>

        <div className="row g-4 ls-3d-stage align-items-stretch">
          {PANELS.map((panel, i) => (
            <Reveal
              key={panel.title}
              className="col-12 col-md-4"
              delay={i * 0.12}
            >
              <TiltCard maxTilt={8}>
                <div className="ls-3d-panel ls-3d-panel--static" style={{ height: '100%' }}>
                  <div style={{ position: 'relative', height: 280 }}>
                    <img
                      src={panel.image}
                      alt={panel.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, transparent 35%, rgba(41,39,34,0.92) 100%)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: 18,
                        right: 18,
                        bottom: 18,
                        color: '#fff',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.7rem',
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          color: 'var(--ls-gold)',
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        Interactive 3D
                      </div>
                      <h3
                        style={{
                          fontFamily: 'var(--ls-font-serif)',
                          fontSize: '1.35rem',
                          marginBottom: 4,
                        }}
                      >
                        {panel.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          opacity: 0.8,
                          marginBottom: 12,
                        }}
                      >
                        {panel.caption}
                      </p>
                      <Link
                        to={panel.to}
                        className="ls-btn-gold"
                        style={{
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                        }}
                      >
                        Explore Suite
                      </Link>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
