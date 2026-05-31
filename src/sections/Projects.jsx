import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "../data/portfolio.js";

const PARALLAX_SPEEDS = [60, 38, 72, 44];

export default function Projects() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(
    () => {
      const cards = cardsRef.current.filter(Boolean);

      // Headline fade-in
      gsap.fromTo(
        ".work-headline",
        { opacity: 0, y: 18 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: ".work-headline", start: "top 88%", once: true },
        }
      );

      // Parallax per card
      cards.forEach((card, i) => {
        const speed = PARALLAX_SPEEDS[i % PARALLAX_SPEEDS.length];
        ScrollTrigger.create({
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          onUpdate(self) {
            card.style.setProperty("--ypar", `${(self.progress - 0.5) * speed * -1}px`);
          },
        });
      });

      // Block reveal
      cards.forEach((card) => {
        const reveal = card.querySelector(".stck-reveal");
        if (!reveal) return;
        gsap.to(reveal, {
          scaleX: 0,
          duration: 1.1,
          ease: "power3.inOut",
          scrollTrigger: { trigger: card, start: "top 80%", once: true },
        });
      });

      // Mouse parallax + glow
      const removers = [];
      cards.forEach((card) => {
        const link = card.querySelector(".stck-el-h");
        const glow = card.querySelector(".stck-mfollow");

        function onMove(e) {
          const { left, top, width, height } = card.getBoundingClientRect();
          const x = e.clientX - left;
          const y = e.clientY - top;
          link.style.setProperty("--trx", `${(x / width - 0.5) * 22}px`);
          link.style.setProperty("--try", `${(y / height - 0.5) * 12}px`);
          glow?.style.setProperty("--mx", `${x}px`);
          glow?.style.setProperty("--my", `${y}px`);
        }

        function onLeave() {
          gsap.to(link, { "--trx": "0px", "--try": "0px", duration: 0.8, ease: "power2.out", overwrite: "auto" });
        }

        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        removers.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        });
      });

      return () => removers.forEach((fn) => fn());
    },
    { scope: sectionRef }
  );

  return (
    <section className="pt-[120px]" id="work" ref={sectionRef}>
      <div className="container">
        <h2 className="work-headline font-display text-[clamp(32px,5.5vw,60px)] font-bold tracking-[-0.05em] leading-none text-[#111] opacity-0 mb-[60px]">
          Selected work
        </h2>
        <div className="flex flex-col gap-[2.4rem] pb-[50vh]">
          {projects.map((project, i) => {
            const nth = i + 1;
            const isOdd = nth % 2 !== 0;
            const is3n1 = nth % 3 === 1;

            return (
              <div
                key={project.id}
                className={`stck-el aspect-[450/500] w-full relative overflow-hidden rounded-[22px]${isOdd ? " ml-auto" : ""}${is3n1 ? " max-w-[45rem]" : ""}`}
                ref={(el) => (cardsRef.current[i] = el)}
              >
                <div className="stck-reveal absolute inset-0 bg-[#111] z-10 origin-left pointer-events-none" />
                <a
                  href={project.detailUrl}
                  className="stck-el-h"
                  style={{ "--trx": "0px", "--try": "0px" }}
                >
                  {project.videoUrl ? (
                    <video
                      src={project.videoUrl}
                      autoPlay
                      loop
                      playsInline
                      muted
                      className="absolute inset-0 w-[105%] h-[105%] object-cover block"
                    />
                  ) : (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="absolute inset-0 w-[105%] h-[105%] object-cover block"
                    />
                  )}
                  <div className="stck-mfollow" />
                  <div className="absolute bottom-6 left-6 z-[3]">
                    <div className="inline-flex bg-[rgba(10,10,10,0.52)] backdrop-blur-sm border border-white/[0.10] rounded-full px-[18px] py-2.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-white tracking-[-0.01em] leading-[1.2]">
                          {project.name}
                        </span>
                        <span className="text-[10px] font-medium text-white/55 tracking-[0.06em] uppercase">
                          {project.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
