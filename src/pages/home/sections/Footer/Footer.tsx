import { useEffect, useRef, useState } from "react";
import { navLinks, profile } from "../../../../data/portfolio";
import { useFooterGlow } from "./useFooterGlow";

const LABEL =
  "text-[11px] font-semibold tracking-[0.18em] uppercase text-white/40 mb-3";
const LINK =
  "block py-1 text-[15px] text-white/75 transition-colors duration-200 hover:text-white";

function deviceLine(): string {
  const ua = navigator.userAgent;
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac/.test(ua)
        ? "macOS"
        : /Win/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "Web";
  return `${os} · ${window.innerWidth}×${window.innerHeight}`;
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useFooterGlow(footerRef, canvasRef);

  // "Your device" meta — read once on mount (client-only app)
  const [device, setDevice] = useState("");
  useEffect(() => setDevice(deviceLine()), []);

  return (
    <footer
      ref={footerRef}
      className="relative h-[75vh] min-h-[620px] bg-[#0d0d0d] text-white max-md:h-auto -mt-px"
    >
      {/* ^ -mt-px: ScrollSmoother translates #smooth-content by fractional
          pixels; on DPR-2 screens the Contact/footer boundary can round to a
          half-pixel gap exposing the white body — a hairline. Overlapping by
          1px hides it (both sides are #0d0d0d). */}
      {/* CSS fallback gradient — visible when WebGL is unavailable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,#0d0d0d_0%,#071322_42%,#0a3055_72%,#1565b8_100%)]"
      />
      {/* Dithered-waves shader (Bayer ordered dither, self-animating).
          The canvas laps 20vh up into Contact's empty bottom padding (above
          its bg, below its z-[1] content): sparse dots surface through the
          boundary and the dither edge "breathes" up and down across it, so
          the two sections blend back and forth. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[-20vh] block w-full h-[calc(100%+20vh)]"
      />

      <div className="relative z-[1] flex h-full flex-col justify-between px-[clamp(24px,5vw,64px)] pt-[12vh] pb-[clamp(28px,5vh,56px)] max-md:gap-20 max-md:py-20">
        {/* ── Top row: name left, link columns right ──── */}
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <p
            data-reveal
            className="font-display text-[clamp(44px,5.4vw,76px)] font-semibold tracking-[-0.04em] leading-[0.98] text-white"
          >
            Dat Phan
          </p>
          <div
            data-reveal
            className="flex gap-[clamp(56px,9vw,140px)]"
          >
          <nav aria-label="Footer">
            <p className={LABEL}>Menu</p>
            <ul>
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className={LINK}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className={LABEL}>Connect</p>
            <ul>
              <li>
                <a href={`mailto:${profile.email}`} className={LINK}>
                  Email
                </a>
              </li>
              <li>
                <a href="#" className={LINK}>
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className={LINK}>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
          </div>
        </div>

        {/* ── Meta row — bottom ───────────────────────── */}
        <div
          data-reveal
          className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4"
        >
          <div>
            <p className="text-[15px] text-white/90">
              © {new Date().getFullYear()} {profile.name}
            </p>
            <p className="text-[15px] text-white/45">Personal portfolio</p>
          </div>
          <div>
            <p className="text-[15px] text-white/90">Based in</p>
            <p className="text-[15px] text-white/45">{profile.location}</p>
          </div>
          <div>
            <p className="text-[15px] text-white/90">Your device</p>
            <p className="text-[15px] text-white/45">{device}</p>
          </div>
          <div>
            <p className="text-[15px] text-white/90">Fonts used</p>
            <p className="text-[15px] text-white/45">Saira, Caveat</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
