import { useRef } from "react";
import { careerEntries } from "../../../../data/portfolio";
import { useCareerReveal } from "./useCareerReveal";

export default function Career() {
  const sectionRef = useRef<HTMLElement>(null);
  useCareerReveal(sectionRef);

  return (
    <section className="py-[120px]" id="career" ref={sectionRef}>
      <div className="container">
        <div className="career-header flex items-start justify-between gap-6 mb-[90px] max-md:flex-col max-md:mb-14">
          <div className="career-headings">
            <h2 className="text-[clamp(44px,5vw,76px)] font-semibold tracking-[-0.04em] leading-none">
              Work <em className="not-italic text-accent">Experience</em>
            </h2>
          </div>
          <a
            href="#"
            className="hidden career-cv flex-none bg-black/[0.06] text-[#111] px-[22px] py-3 rounded-full text-[16px] font-medium hover:bg-black/[0.12] transition-colors duration-200"
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
                <h3 className="text-[clamp(24px,2.4vw,32px)] font-semibold tracking-[-0.02em]">
                  {entry.role}
                </h3>
                <p className="mt-[18px] text-black/40 text-[18px]">
                  {entry.company}
                </p>
              </div>
              <span className="flex-none text-black/50 text-[18px] pt-1.5">
                {entry.period}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
