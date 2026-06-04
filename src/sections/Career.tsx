import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { careerEntries } from '../data/portfolio';

export default function Career() {
  const sectionRef = useRef<HTMLElement>(null);

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
    <section className="py-[120px]" id="career" ref={sectionRef}>
      <div className="container">

        <div className="career-header flex items-start justify-between gap-6 mb-[90px] max-md:flex-col max-md:mb-14">
          <div className="career-headings">
            <p className="font-script text-[24px] text-[#111] mb-[26px]">/ Career</p>
            <h2 className="text-[clamp(44px,5vw,76px)] font-bold tracking-[-0.03em] leading-none">
              Work <em className="not-italic text-[#ff3700]">Experience</em>
            </h2>
            <p className="mt-[22px] text-black/50 text-[18px]">My impact over the years.</p>
          </div>
          <a
            href="#"
            className="career-cv flex-none bg-black/[0.06] text-[#111] px-[22px] py-3 rounded-full text-[16px] font-medium hover:bg-black/[0.12] transition-colors duration-200"
          >
            Download CV
          </a>
        </div>

        <ul className="career-list flex flex-col">
          {careerEntries.map((entry, i) => (
            <li
              className="career-row flex items-start justify-between gap-6 py-9 border-b border-black/[0.08] first:pt-0 last:border-b-0"
              key={i}
            >
              <div>
                <h3 className="text-[clamp(24px,2.4vw,32px)] font-bold tracking-[-0.015em]">{entry.role}</h3>
                <p className="mt-[18px] text-black/40 text-[18px]">{entry.company}</p>
              </div>
              <span className="flex-none text-black/50 text-[18px] pt-1.5">{entry.period}</span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
