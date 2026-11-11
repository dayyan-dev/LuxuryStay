import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';

/**
 * Subtle 3D perspective tilt — luxury depth, not a gimmick.
 */
export default function TiltCard({
  children,
  className = '',
  style,
  maxTilt = 6,
  glare = true,
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const spring = { stiffness: 240, damping: 24, mass: 0.4 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const rotateX = useTransform(sy, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [0, 1], [-maxTilt, maxTilt]);
  const glareX = useTransform(sx, [0, 1], ['0%', '100%']);
  const glareY = useTransform(sy, [0, 1], ['0%', '100%']);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.18), transparent 55%)`;

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(Math.min(1, Math.max(0, px)));
    y.set(Math.min(1, Math.max(0, py)));
  };

  const handleLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  if (reduceMotion) {
    return (
      <div className={`ls-tilt-static ${className}`.trim()} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`ls-tilt-card ${className}`.trim()}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="ls-tilt-inner">{children}</div>
      {glare && (
        <motion.div className="ls-tilt-glare" aria-hidden style={{ background: glareBg }} />
      )}
    </motion.div>
  );
}
