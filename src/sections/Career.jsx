import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { careerEntries } from '../data/portfolio.js';

export default function Career() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      // Header block
      gsap.fromTo(
        '.career-headings',
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0,
          duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.career-header', start: 'top 83%' },
        },
      );

      // CV button beside the heading
      gsap.fromTo(
        '.career-cv',
        { opacity: 0, x: 20 },
        {
          opacity: 1, x: 0,
          duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '.career-header', start: 'top 83%' },
        },
      );

      // Career rows draw in with stagger and a subtle clip-from-bottom feel
      gsap.fromTo(
        '.career-row',
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.75, ease: 'power3.out',
          stagger: 0.13,
          scrollTrigger: { trigger: '.career-list', start: 'top 85%' },
        },
      );

      return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    },
    { scope: sectionRef },
  );

  return (
    <section className="career" id="career" ref={sectionRef}>
      <div className="container">

        <div className="career-header">
          <div className="career-headings">
            <p className="career-eyebrow">/ Career</p>
            <h2 className="career-title">Work <em>Experience</em></h2>
            <p className="career-sub">My impact over the years.</p>
          </div>
          <a href="#" className="career-cv">Download CV</a>
        </div>

        <ul className="career-list">
          {careerEntries.map((entry, i) => (
            <li className="career-row" key={i}>
              <div className="career-role">
                <h3 className="career-job">{entry.role}</h3>
                <p className="career-company">{entry.company}</p>
              </div>
              <span className="career-period">{entry.period}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
