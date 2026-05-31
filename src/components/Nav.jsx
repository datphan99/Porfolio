import { useState } from 'react';
import { navLinks, profile } from '../data/portfolio.js';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute z-[60] top-0 left-0 right-0 pt-7">
      <div className="container">
        <nav className="relative flex items-center justify-between gap-6">
          <a href="#" className="font-semibold tracking-[-0.01em] text-[18px]">{profile.name}</a>

          <button
            className="relative z-[80] w-11 h-11 rounded-full bg-white flex flex-col items-center justify-center gap-1.5 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-105"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`w-[22px] h-px bg-[#111] rounded-sm block transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]${open ? ' translate-y-[3.5px] rotate-45' : ''}`}
            />
            <span
              className={`w-[22px] h-px bg-[#111] rounded-sm block transition-transform duration-[350ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]${open ? ' -translate-y-[3.5px] -rotate-45' : ''}`}
            />
          </button>

          {open && (
            <div
              className="fixed inset-0 z-[50] bg-black/[0.04] cursor-pointer"
              aria-hidden="true"
              onClick={() => setOpen(false)}
            />
          )}

          <aside
            className={`absolute top-[calc(100%+16px)] right-0 z-[70] w-[min(380px,calc(100vw-48px))] bg-white rounded-[28px] px-11 pt-11 pb-9 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.35)] transition-[opacity,transform,visibility] duration-[350ms] ease-in-out${open ? ' opacity-100 visible translate-y-0' : ' opacity-0 invisible -translate-y-[6px]'}`}
            role="dialog"
            aria-label="Navigation menu"
          >
            <ul className="flex flex-col gap-1">
              {navLinks.map(({ href, label }, i) => (
                <li
                  key={label}
                  className={`transition-[opacity,transform] duration-[400ms] ease-out${open ? ' opacity-100 translate-x-0' : ' opacity-0 -translate-x-[14px]'}`}
                  style={{ transitionDelay: open ? `${0.12 + i * 0.06}s` : '0s' }}
                >
                  <a
                    href={href}
                    className="block py-2 text-[26px] font-medium tracking-[-0.02em] text-[#111] transition-[color,padding-left] duration-200 hover:text-[#ff3700] hover:pl-2"
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <div
              className={`flex gap-3.5 mt-8 pt-7 border-t border-black/[0.08] transition-[opacity,transform] duration-[400ms] ease-out${open ? ' opacity-100 translate-y-0 [transition-delay:0.42s]' : ' opacity-0 translate-y-2 [transition-delay:0s]'}`}
            >
              <a href={`mailto:${profile.email}`} aria-label="Email" className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" />
                </svg>
              </a>
              <a href="#" aria-label="Figma" className="w-[50px] h-[50px] rounded-full border border-black/[0.08] grid place-items-center text-black/50 transition-[background,color] duration-200 hover:bg-[#111] hover:text-white">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3H9a3 3 0 0 0 0 6h3m0-6h3a3 3 0 0 1 0 6h-3m0-6v6m0 0H9a3 3 0 0 0 0 6h3v-6zm0 6v3a3 3 0 1 1-3-3h3zm0-6h0a3 3 0 1 0 3 3 3 3 0 0 0-3-3z" />
                </svg>
              </a>
            </div>
          </aside>
        </nav>
      </div>
    </header>
  );
}
