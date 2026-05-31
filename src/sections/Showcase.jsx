import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { showcaseItems } from '../data/portfolio.js';

export default function Showcase() {
  const sectionRef = useRef(null);
  const topItems    = showcaseItems.slice(0, 2);
  const bottomItems = showcaseItems.slice(2);

  useGSAP(
    () => {
      // Frame entrance
      gsap.fromTo(
        '.showcase-frame',
        { opacity: 0, y: 56, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.showcase-frame', start: 'top 88%' },
        },
      );

      // Cards stagger inside the frame
      gsap.fromTo(
        '.showcase-card',
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: '.showcase-frame', start: 'top 82%' },
        },
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef },
  );

  return (
    <section className="showcase" ref={sectionRef}>
      <div className="container">
        <div className="showcase-frame">

          <div className="showcase-row showcase-row--top">
            {topItems.map((item) => (
              <figure className="showcase-card" key={item.id}>
                {item.tag && <span className="showcase-tag">{item.tag}</span>}
                <img
                  src={`https://placehold.co/640x400?text=Project+${item.id}`}
                  alt={item.alt}
                />
              </figure>
            ))}
          </div>

          {/* Play button sits in the seam between the two rows */}
          <div className="showcase-play">
            <button type="button" aria-label="Play showreel">▶</button>
          </div>

          <div className="showcase-row showcase-row--bottom">
            {bottomItems.map((item) => (
              <figure className="showcase-card" key={item.id}>
                <img
                  src={`https://placehold.co/640x300?text=Project+${item.id}`}
                  alt={item.alt}
                />
              </figure>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
