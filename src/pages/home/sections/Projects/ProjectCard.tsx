import { type Ref } from "react";

export interface ProjectCardData {
  name: string;
  tag: string;
  img: string;
}

interface CardProps {
  p: ProjectCardData;
  i: number;
  ref: Ref<HTMLElement>;
}

export default function ProjectCard({ p, i, ref }: CardProps) {
  const sideClass = i % 2 === 0 ? "is-right right-side" : "is-left left-side";
  return (
    <figure
      ref={ref}
      className={
        `project absolute top-1/2 z-[2] rounded-[30px] ` +
        `w-[clamp(280px,34vw,512px)] aspect-[512/570] ${sideClass} ` +
        `[will-change:transform,opacity,filter] ` +
        `after:content-[''] after:absolute after:-inset-px after:z-[3] ` +
        `after:rounded-[30px] after:pointer-events-none ` +
        `after:[box-shadow:inset_0_0_4rem_8rem_var(--color-night)]`
      }
    >
      <div className="absolute inset-0 rounded-[30px] overflow-hidden">
        <img
          src={p.img}
          alt={`${p.name} — ${p.tag}`}
          className="w-full h-full object-cover"
        />
      </div>
      <figcaption
        className={
          `absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] ` +
          `whitespace-nowrap inline-flex items-baseline gap-[0.55em] ` +
          `px-[0.95em] py-[0.56em] rounded-full text-white ` +
          `bg-[rgba(120,120,120,0.28)] [backdrop-filter:blur(7px)_saturate(1.3)] ` +
          `[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.22),0_6px_20px_-10px_rgba(0,0,0,0.4)]`
        }
      >
        <b className="text-[15px] font-semibold tracking-[-0.01em]">{p.name}</b>
        <span className="text-[14px] font-normal opacity-80">{p.tag}</span>
      </figcaption>
    </figure>
  );
}
