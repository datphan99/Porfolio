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
    <section className="skills" id="skills" ref={sectionRef}>
      <div className="container">
        <div className="skills-layout">

          <div className="skills-main">
            <div className="skills-header">
              <h2 className="skills-title">What I do <em>best</em>?</h2>
              <p className="skills-sub">
                I lead brands, teams, and projects — creating design, web, video,
                and marketing solutions that help businesses grow and make a real impact.
              </p>
            </div>

            <div className="skills-stack">
              {skills.map((skill, i) => (
                <div
                  className="skill-section"
                  key={skill.id}
                  style={{ '--card-index': i }}
                >
                  <article className="skill-card">
                    <div className="skill-card-inner">
                      <span className="skill-tag">{skill.tag}</span>
                      <h3 className="skill-name">{skill.name}</h3>
                      <p className="skill-desc">{skill.description}</p>
                      <ul className="skill-list">
                        {skill.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="skill-card-overlay" />
                  </article>
                </div>
              ))}
            </div>
          </div>

          <aside className="skills-author">
            <img
              src="https://placehold.co/480x600?text=Author"
              alt={`${profile.name} portrait`}
            />
            <div className="skills-author-meta">
              <div className="skills-author-name">{profile.name}</div>
              <div className="skills-author-role">{profile.role}</div>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}
