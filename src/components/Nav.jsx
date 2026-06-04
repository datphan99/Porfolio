import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { navLinks, profile } from "../data/portfolio.js";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const eyebrowRef = useRef(null);

  useEffect(() => {
    const el = eyebrowRef.current;
    if (!el) return;

    // hidden on initial load — hero section owns the eyebrow area
    gsap.set(el, { opacity: 0, y: -14 });

    const st = ScrollTrigger.create({
      start: 60,
      end: 99999,
      onUpdate(self) {
        if (self.direction === 1) {
          // scrolling down — slide up + fade out
          gsap.to(el, {
            y: -14,
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        } else {
          // scrolling up — return to position
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      },
    });

    return () => st.kill();
  }, []);

  return (
    <>
      {/* Eyebrow — fixed top-centre, hides on scroll down */}
      <p
        ref={eyebrowRef}
        className="fixed z-[60] top-7 inset-x-0 text-center text-[11px] font-bold tracking-[0.18em] uppercase text-ink pointer-events-none select-none"
      >
        {profile.role}
      </p>

      {/* Menu link — fixed right edge, vertically centred */}
      <div className="fixed z-[60] right-[clamp(24px,4vw,56px)] top-8 -translate-y-1/2">
        <button
          className="nav-menu-btn relative text-[13px] font-bold tracking-[0.12em] uppercase text-ink bg-transparent border-0 cursor-pointer"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>

        {/* Backdrop */}
        {open && (
          <div
            className="fixed inset-0 z-[-1] bg-black/[0.04] cursor-pointer"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Dropdown panel */}
        <aside
          className={`absolute top-[calc(100%+16px)] right-0 z-[70] w-[min(300px,calc(100vw-48px))] bg-white rounded-[28px] px-11 pt-11 pb-9 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.35)] transition-[opacity,translate,visibility] duration-[350ms] ease-in-out${open ? " opacity-100 visible translate-y-0" : " opacity-0 invisible -translate-y-[6px]"}`}
          role="dialog"
          aria-label="Navigation menu"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map(({ href, label }, i) => (
              <li
                key={label}
                className={`transition-[opacity,translate] duration-[400ms] ease-out${open ? " opacity-100 translate-x-0" : " opacity-0 -translate-x-[14px]"}`}
                style={{ transitionDelay: open ? `${0.12 + i * 0.06}s` : "0s" }}
              >
                <a
                  href={href}
                  className="block py-2 text-sm font-medium tracking-[-0.02em] text-[#111] transition-[color,padding-left] duration-200 hover:text-[#ff3700] hover:pl-2"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          <div
            className={`flex gap-3.5 mt-8 pt-7 border-t border-black/[0.08] transition-[opacity,translate] duration-[400ms] ease-out${open ? " opacity-100 translate-y-0 [transition-delay:0.42s]" : " opacity-0 translate-y-2 [transition-delay:0s]"}`}
          >
            <a
              href={`mailto:${profile.email}`}
              aria-label="Email"
              className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Figma"
              className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 3H9a3 3 0 0 0 0 6h3m0-6h3a3 3 0 0 1 0 6h-3m0-6v6m0 0H9a3 3 0 0 0 0 6h3v-6zm0 6v3a3 3 0 1 1-3-3h3zm0-6h0a3 3 0 1 0 3 3 3 3 0 0 0-3-3z" />
              </svg>
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
