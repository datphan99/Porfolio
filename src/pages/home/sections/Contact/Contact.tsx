import { useEffect, useRef, useState } from "react";
import {
  contactBudgets,
  contactInterests,
  profile,
} from "../../../../data/portfolio";
import { useContactReveal } from "./useContactReveal";
import { useMagneticPills } from "./useMagneticPills";

const pillCls = (active: boolean) =>
  `contact-pill inline-flex items-center rounded-full border px-[18px] py-2.5 text-[13px] font-medium will-change-transform transition-colors duration-200 ${
    active
      ? "bg-white text-[#15161a] border-white"
      : "border-white/15 text-white hover:border-white/45"
  }`;

const fieldCls = (error: boolean) =>
  `w-full bg-transparent rounded-[14px] border px-5 py-3.5 text-[15px] text-white placeholder:text-white/35 outline-none transition-colors duration-200 ${
    error ? "border-[#ff3700]" : "border-white/15 focus:border-white/55"
  }`;

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  useContactReveal(sectionRef);
  useMagneticPills(sectionRef);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [budget, setBudget] = useState("");
  const [details, setDetails] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const nameError = touched && !name.trim();
  const emailError = touched && !email.trim();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setTouched(true);
      return;
    }
    // Visual-only: static site has no backend — confirm, then reset the label.
    setStatus("sent");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-[clamp(90px,12vh,150px)]"
    >
      {/* Dark panel — starts as an inset rounded card on the white page and
          expands to full-bleed as the section scrolls in (scrubbed in
          useContactReveal). Content sits above it, unscaled. */}
      <div
        className="contact-bg absolute inset-0 bg-[#0d0d0d] will-change-transform"
        aria-hidden="true"
      />
      {/* z-[1] is load-bearing: the footer's dither canvas laps 20vh up over
          this section (later in DOM, so it paints above z-auto siblings) —
          the content must sit in a higher layer or the canvas covers it. */}
      <div className="container relative z-[1] grid gap-x-16 gap-y-14 md:grid-cols-2 md:items-center">
        {/* ── Left: statement ─────────────────────────── */}
        <div>
          <p
            data-reveal
            className="text-[12px] font-semibold tracking-[0.22em] uppercase text-white/45 mb-7"
          >
            ( Contact )
          </p>
          {/* Staggered three-line headline, indented like the reference */}
          <h2
            data-reveal
            className="font-display font-semibold uppercase tracking-[-0.03em] leading-[0.9] text-[clamp(38px,6.4vw,88px)] text-white"
          >
            <span className="block">Let's start</span>
            <span className="block pl-[16%] md:pl-[26%]">creating</span>
            <span className="block pl-[6%] md:pl-[10%]">
              {/* accent matches the footer's dither blue — the two sections
                  share one accent as they blend into each other */}
              <em className="not-italic text-accent">together</em>
            </span>
          </h2>
          <div data-reveal className="mt-12">
            <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-white/45 mb-2">
              Say hi
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="text-[clamp(18px,2vw,24px)] font-medium text-white underline decoration-white/25 underline-offset-[6px] transition-colors duration-200 hover:decoration-accent"
            >
              {profile.email}
            </a>
          </div>
        </div>

        {/* ── Right: form ─────────────────────────────── */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-[22px] border border-white/10 bg-white/[0.03] p-[clamp(22px,3vw,34px)]"
        >
          <div data-reveal>
            <p className="text-[13px] font-medium text-white/45 mb-3">
              Your Data
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                aria-label="Name"
                placeholder="Name*"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldCls(nameError)}
              />
              <input
                aria-label="Email"
                type="email"
                placeholder="Email*"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldCls(emailError)}
              />
            </div>
          </div>

          <div data-reveal className="mt-7">
            <p className="text-[13px] font-medium text-white/45 mb-3">
              You are interested in
            </p>
            <div className="flex flex-wrap gap-2.5">
              {contactInterests.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  data-magnetic
                  aria-pressed={interest === opt}
                  onClick={() =>
                    setInterest((prev) => (prev === opt ? "" : opt))
                  }
                  className={pillCls(interest === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div data-reveal className="mt-7">
            <p className="text-[13px] font-medium text-white/45 mb-3">
              Budget in USD
            </p>
            <div className="flex flex-wrap gap-2.5">
              {contactBudgets.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  data-magnetic
                  aria-pressed={budget === opt}
                  onClick={() => setBudget((prev) => (prev === opt ? "" : opt))}
                  className={pillCls(budget === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div data-reveal className="mt-7">
            <textarea
              aria-label="Project details"
              placeholder="Project details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              className={`${fieldCls(false)} resize-none`}
            />
          </div>

          <div data-reveal className="mt-4">
            <button
              type="submit"
              disabled={status === "sent"}
              className="w-full rounded-full bg-white py-4 text-[15px] font-medium text-[#15161a] transition-opacity duration-200 hover:opacity-90 disabled:opacity-100"
            >
              {status === "sent" ? "Message sent ✓" : "Submit Message"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
