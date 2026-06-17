import { useRef, useState } from "react";
import { contactOpportunityTypes, profile } from "../../../../data/portfolio";
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
  const [opportunityType, setOpportunityType] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const nameError = touched && !name.trim();
  const emailError = touched && !email.trim();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setTouched(true);
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, opportunityType, company, message }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
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
          <h2
            data-reveal
            className="font-display font-semibold uppercase tracking-[-0.03em] leading-[0.9] text-[clamp(38px,6.4vw,88px)] text-white"
          >
            <span className="block">Let's start</span>
            <span className="block pl-[16%] md:pl-[26%]">creating</span>
            <span className="block pl-[6%] md:pl-[10%]">
              {/* accent matches the footer's dither blue */}
              <em className="not-italic text-accent">together</em>
            </span>
          </h2>
          <div data-reveal className="mt-12">
            <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-white/45 mb-2">
              Contact
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
              Your info
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                aria-label="Name"
                placeholder="Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldCls(nameError)}
              />
              <input
                aria-label="Email"
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldCls(emailError)}
              />
            </div>
          </div>

          <div data-reveal className="mt-7">
            <p className="text-[13px] font-medium text-white/45 mb-3">
              Opportunity type
            </p>
            <div className="flex flex-wrap gap-2.5">
              {contactOpportunityTypes.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  data-magnetic
                  aria-pressed={opportunityType === opt}
                  onClick={() =>
                    setOpportunityType((prev) => (prev === opt ? "" : opt))
                  }
                  className={pillCls(opportunityType === opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div data-reveal className="mt-7">
            <input
              aria-label="Company or organisation"
              placeholder="Company / Organisation"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={fieldCls(false)}
            />
          </div>

          <div data-reveal className="mt-4">
            <textarea
              aria-label="Message"
              placeholder="Tell me about the role or opportunity..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className={`${fieldCls(false)} resize-none`}
            />
          </div>

          <div data-reveal className="mt-4">
            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className="w-full rounded-full bg-white py-4 text-[15px] font-medium text-[#15161a] transition-opacity duration-200 hover:opacity-90 disabled:opacity-75"
            >
              {status === "sending" && "Sending…"}
              {status === "sent" && "Message sent ✓"}
              {status === "error" && "Something went wrong — try again"}
              {status === "idle" && "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
