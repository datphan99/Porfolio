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
    <section className="pt-10 pb-20" ref={sectionRef}>
      <div className="container">
        <div className="showcase-frame relative bg-[#1a1a1a] rounded-[28px] p-[22px] grid gap-[18px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]">

          <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
            {topItems.map((item) => (
              <figure
                className="showcase-card relative m-0 bg-white rounded-[16px] overflow-hidden aspect-[16/10]"
                key={item.id}
              >
                {item.tag && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/[0.78] text-white px-[18px] py-2 rounded-full text-[13px] z-[2]">
                    {item.tag}
                  </span>
                )}
                <img
                  src={`https://placehold.co/640x400?text=Project+${item.id}`}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </figure>
            ))}
          </div>

          {/* Play button sits in the seam between the two rows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[3]">
            <button
              type="button"
              aria-label="Play showreel"
              className="w-[72px] h-[72px] rounded-full bg-white text-[#111] text-[22px] grid place-items-center shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            >
              ▶
            </button>
          </div>

          <div className="grid grid-cols-2 gap-[18px] max-md:grid-cols-1">
            {bottomItems.map((item) => (
              <figure
                className="showcase-card relative m-0 bg-white rounded-[16px] overflow-hidden aspect-[16/7]"
                key={item.id}
              >
                <img
                  src={`https://placehold.co/640x300?text=Project+${item.id}`}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                />
              </figure>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
