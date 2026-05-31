import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skills, profile } from '../data/portfolio.js';

const SCROLL_GAP = 160; // extra px of scroll room per card before next card enters

export default function Skills() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const sectionEls = gsap.utils.toArray('.skill-section', section);
      const cardEls = gsap.utils.toArray('.skill-card', section);

      // ── Header ──────────────────────────────────────────
      gsap.fromTo(
        '.skills-header',
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.skills-header', start: 'top 83%' },
        },
      );

      // ── Section heights ──────────────────────────────────
      // Each non-last section = card height + scroll gap so the card is fully
      // readable before the next one slides in from below.
      const cardH = cardEls[0].offsetHeight;
      sectionEls.forEach((sec, i) => {
        if (i < sectionEls.length - 1) {
          gsap.set(sec, { minHeight: cardH + SCROLL_GAP });
        }
      });

      // ── Overlay: dim covered cards ───────────────────────
      // When section[i+1] scrolls up from the bottom, fade in the white veil
      // on card[i] so it reads as "behind" the incoming card.
      sectionEls.forEach((sec, i) => {
        if (i === sectionEls.length - 1) return;
        const overlay = sec.querySelector('.skill-card-overlay');
        const nextSec = sectionEls[i + 1];

        gsap.fromTo(
          overlay,
          { opacity: 0 },
          {
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: nextSec,
              start: 'top bottom',
              end: 'top 15%',
              scrub: true,
            },
          },
        );
      });

      // ── Author portrait ──────────────────────────────────
      gsap.fromTo(
        '.skills-author',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1, scale: 1,
          duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.skills-author', start: 'top 85%' },
        },
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef },
  );

  return (
    <section className="pt-[60px]" id="skills" ref={sectionRef}>
      <div className="container">
        <div className="grid [grid-template-columns:minmax(0,520px)_300px] gap-[70px] items-start justify-between mx-[80px] max-lg:grid-cols-1 max-lg:gap-10 max-lg:mx-0">

          <div>
            <div className="skills-header max-w-[560px] mb-20">
              <h2 className="text-[clamp(48px,5.6vw,80px)] font-bold tracking-[-0.03em] leading-[1.02] mt-3.5">
                What I do <em className="not-italic text-[#ff3700]">best</em>?
              </h2>
              <p className="mt-[22px] text-black/50 text-[16px] max-w-[480px]">
                I lead brands, teams, and projects — creating design, web, video,
                and marketing solutions that help businesses grow and make a real impact.
              </p>
            </div>

            <div>
              {skills.map((skill, i) => (
                <div
                  className="skill-section relative"
                  key={skill.id}
                  style={{ '--card-index': i }}
                >
                  <article className="skill-card p-[18px] border border-black/[0.18] rounded-[28px] bg-transparent cursor-pointer">
                    <div className="bg-white rounded-[22px] px-9 pt-[34px] pb-[38px] shadow-[0_1px_0_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.18)]">
                      <span className="inline-block font-script text-[20px] text-[#111] mb-6">{skill.tag}</span>
                      <h3 className="text-[clamp(28px,3vw,36px)] font-bold tracking-[-0.02em] leading-[1.05]">{skill.name}</h3>
                      <p className="mt-[18px] text-black/50 text-[15px] leading-[1.5] max-w-[400px]">{skill.description}</p>
                      <ul className="mt-[26px] grid gap-[9px] text-black/50 text-[15px] list-disc pl-[22px]">
                        {skill.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="skill-card-overlay absolute inset-0 rounded-[28px] bg-white/[0.82] opacity-0 pointer-events-none z-10" />
                  </article>
                </div>
              ))}
            </div>
          </div>

          <aside className="skills-author sticky top-[100px] aspect-[4/5] rounded-[22px] overflow-hidden bg-[#1a1a1a] max-lg:relative max-lg:top-0 max-lg:max-w-[360px]">
            <img
              src="https://placehold.co/480x600?text=Author"
              alt={`${profile.name} portrait`}
              className="w-full h-full object-cover opacity-[0.85]"
            />
            <div className="absolute left-0 right-0 bottom-0 px-7 py-7 text-white [background:linear-gradient(180deg,transparent,rgba(0,0,0,0.55)_60%)]">
              <div className="text-[26px] font-bold tracking-[-0.01em]">{profile.name}</div>
              <div className="mt-1 text-[16px] opacity-90">{profile.role}</div>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}
