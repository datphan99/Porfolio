import AceTernityLogo from "@/components/logos/aceternity";
import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { FaAws } from "react-icons/fa6";
import { RiNextjsFill, RiNodejsFill, RiReactjsFill } from "react-icons/ri";
import {
  SiChakraui,
  SiDocker,
  SiExpress,
  SiFirebase,
  SiJavascript,
  SiMongodb,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiReactquery,
  SiSanity,
  SiShadcnui,
  SiSocketdotio,
  SiSupabase,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVuedotjs,
  SiVite,
  SiNetlify,
  SiHtml5,
  SiCss3,
  SiBootstrap,
  SiApachemaven,
  SiCplusplus,
  SiArduino,
  SiRedux,
} from "react-icons/si";
import { TbBrandFramerMotion } from "react-icons/tb";
import css from "styled-jsx/css";
const BASE_PATH = "/assets/projects-screenshots";

const ProjectsLinks = ({ live, repo }: { live: string; repo?: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-start gap-3 my-3 mb-8">
      {repo && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={repo}
        >
          <Button variant={"default"} size={"sm"}>
            Github
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};

const PROJECT_SKILLS = {
  next: {
    title: "Next.js",
    bg: "black",
    fg: "white",
    icon: <RiNextjsFill />,
  },
  chakra: {
    title: "Chakra UI",
    bg: "black",
    fg: "white",
    icon: <SiChakraui />,
  },
  node: {
    title: "Node.js",
    bg: "black",
    fg: "white",
    icon: <RiNodejsFill />,
  },
  python: {
    title: "Python",
    bg: "black",
    fg: "white",
    icon: <SiPython />,
  },
  prisma: {
    title: "prisma",
    bg: "black",
    fg: "white",
    icon: <SiPrisma />,
  },
  postgres: {
    title: "PostgreSQL",
    bg: "black",
    fg: "white",
    icon: <SiPostgresql />,
  },
  mongo: {
    title: "MongoDB",
    bg: "black",
    fg: "white",
    icon: <SiMongodb />,
  },
  express: {
    title: "Express",
    bg: "black",
    fg: "white",
    icon: <SiExpress />,
  },
  reactQuery: {
    title: "React Query",
    bg: "black",
    fg: "white",
    icon: <SiReactquery />,
  },
  shadcn: {
    title: "ShanCN UI",
    bg: "black",
    fg: "white",
    icon: <SiShadcnui />,
  },
  aceternity: {
    title: "Aceternity",
    bg: "black",
    fg: "white",
    icon: <AceTernityLogo />,
  },
  tailwind: {
    title: "Tailwind",
    bg: "black",
    fg: "white",
    icon: <SiTailwindcss />,
  },
  docker: {
    title: "Docker",
    bg: "black",
    fg: "white",
    icon: <SiDocker />,
  },
  yjs: {
    title: "Y.js",
    bg: "black",
    fg: "white",
    icon: (
      <span>
        <strong>Y</strong>js
      </span>
    ),
  },
  firebase: {
    title: "Firebase",
    bg: "black",
    fg: "white",
    icon: <SiFirebase />,
  },
  sockerio: {
    title: "Socket.io",
    bg: "black",
    fg: "white",
    icon: <SiSocketdotio />,
  },
  js: {
    title: "JavaScript",
    bg: "black",
    fg: "white",
    icon: <SiJavascript />,
  },
  ts: {
    title: "TypeScript",
    bg: "black",
    fg: "white",
    icon: <SiTypescript />,
  },
  vue: {
    title: "Vue.js",
    bg: "black",
    fg: "white",
    icon: <SiVuedotjs />,
  },
  react: {
    title: "React.js",
    bg: "black",
    fg: "white",
    icon: <RiReactjsFill />,
  },
  sanity: {
    title: "Sanity",
    bg: "black",
    fg: "white",
    icon: <SiSanity />,
  },
  spline: {
    title: "Spline",
    bg: "black",
    fg: "white",
    icon: <SiThreedotjs />,
  },
  gsap: {
    title: "GSAP",
    bg: "black",
    fg: "white",
    icon: "",
  },
  framerMotion: {
    title: "Framer Motion",
    bg: "black",
    fg: "white",
    icon: <TbBrandFramerMotion />,
  },
  supabase: {
    title: "Supabase",
    bg: "black",
    fg: "white",
    icon: <SiSupabase />,
  },
  // +
  redux: {
    title: "Redux",
    bg: "black",
    fg: "white",
    icon: <SiRedux />,
  },
  openai: {
    title: "OpenAI",
    bg: "black",
    fg: "white",
    icon: <img src="assets/icons/openai-svgrepo-com_white.svg" alt="OpenAI" />,
  },
  netlify: {
    title: "Netlify",
    bg: "black",
    fg: "white",
    icon: <SiNetlify />,
  },
  html: {
    title: "HTML5",
    bg: "black",
    fg: "white",
    icon: <SiHtml5 />,
  },
  css: {
    title: "CSS3",
    bg: "black",
    fg: "white",
    icon: <SiCss3 />,
  },
  bootstrap: {
    title: "Bootstrap",
    bg: "black",
    fg: "white",
    icon: <SiBootstrap />,
  },
  maven: {
    title: "Maven",
    bg: "black",
    fg: "white",
    icon: <SiApachemaven />,
  },
  aws: {
    title: "AWS",
    bg: "black",
    fg: "white",
    icon: <FaAws />,
  },
  momo: {
    title: "Java",
    bg: "black",
    fg: "white",
    icon: <img src="assets/icons/MOMO-Logo-App.png" alt="Momo" />,
  },
  cplusplus: {
    title: "C++",
    bg: "black",
    fg: "white",
    icon: <SiCplusplus />,
  },
  arduino: {
    title: "Arduino",
    bg: "black",
    fg: "white",
    icon: <SiArduino />,
  },
};
export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode | any;
  github?: string;
  live: string;
};
const projects: Project[] = [
  // +
  {
    // 01. E-commerce PETZ
    id: "petzecommerce",
    category: "Fullstack Developer",
    title: "PETZ - Services & Products",
    src: "/assets/projects-screenshots/petz/thumbnail.png",
    screenshots: ["1.png", "2.png", "3.png"],
    live: "https://ai-docker-file-optimizer.netlify.app/",
    github: "https://github.com/tuyendat09/PETZ-Product-Services",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.redux,
        PROJECT_SKILLS.framerMotion,
      ],
      backend: [
        PROJECT_SKILLS.mongo,
        PROJECT_SKILLS.express,
        PROJECT_SKILLS.aws,
        PROJECT_SKILLS.momo,
      ],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            Step into my graduation lab — where late-night coding sessions
            turned into something way cooler than just passing grades.
          </TypographyP>
          <TypographyH3 className="my-4 mt-8">
            Beautiful 3D Objects{" "}
          </TypographyH3>
          <p className="font-mono mb-2">
            Think of it as an online pet store on steroids 🐾. I single-handedly
            built it full-stack with Next.js + Express.js — playing both
            superhero roles at once, front and back. State? Tamed with Redux
            Toolkit (no wild bugs running loose), and Redux Query fetches data
            so fast it feels psychic. Payments? Even MoMo joined the party —
            because pets deserve premium checkout too.
          </p>
          <p className="font-mono mb-2">
            Login? Smooth as butter with NextAuth. Animations? Brought to life
            with GSAP and Framer Motion — pages don’t just load, they dance.
            Forms? Formik keeps them disciplined like a personal trainer.
          </p>
          <p className="font-mono mb-2">
            And yes, the whole thing does CRUD in every corner of the database
            and even knows who’s the boss with role-based access control.
            Deployed on Vercel, so it ships faster than pizza delivery. 🍕
          </p>
          <ProjectsLinks live={this.live} repo={this.github} />
          <SlideShow
            images={[
              `${BASE_PATH}/petz/1.png`,
              `${BASE_PATH}/petz/2.png`,
              `${BASE_PATH}/petz/3.png`,
              `${BASE_PATH}/petz/4.png`,
              `${BASE_PATH}/petz/5.png`,
            ]}
          />
        </div>
      );
    },
  },

  {
    // 02. Portfolio project
    id: "portfolio",
    category: "Portfolio",
    title: "My Portfolio",
    src: "/assets/projects-screenshots/portfolio/landing.png",
    screenshots: ["assets/projects-screenshots/portfolio/landing.png"],
    live: "https://www.abhijitzende.com/",
    github: "https://github.com/Abhiz2411/3D-interactive-portfolio",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.shadcn,
        PROJECT_SKILLS.aceternity,
        PROJECT_SKILLS.framerMotion,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.spline,
      ],
      backend: [],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            Welcome to my digital playground, where creativity meets code in the
            dopest way possible.
          </TypographyP>
          <TypographyH3 className="my-4 mt-8">
            Beautiful 3D Objects{" "}
          </TypographyH3>
          <p className="font-mono mb-2">
            Did you see that 3D keyboard modal? Yeah! I made that. That
            interactive keyboard is being rendered in 3D on a webpage 🤯, and
            pressing each keycap reveals a skill in a goofy way. It&apos;s like
            typing, but make it art.
          </p>
          <SlideShow
            images={[
              `${BASE_PATH}/myportfolio/landing.png`,
              `${BASE_PATH}/myportfolio/skill.png`,
            ]}
          />

          <TypographyH3 className="my-4 mt-8">Projects</TypographyH3>

          <p className="font-mono mb-2">
            My top personal and freelance projects — no filler, all killer.
          </p>
          <SlideShow
            images={[
              `${BASE_PATH}/myportfolio/project-1.png`,
              `${BASE_PATH}/myportfolio/project-3.png`,
            ]}
          />
          <p className="font-mono mb-2 mt-8 text-center">
            This site&apos;s not just a portfolio — it&apos;s a whole vibe.
          </p>
        </div>
      );
    },
  },
  {
    // 03. Purrfect App
    id: "purrfect",
    category: "Social Media - (WIP)",
    title: "Purrfect - A cozy corner (WIP)",
    src: "/assets/projects-screenshots/purrfect/Thumbnail-1.png",
    screenshots: ["01.jpeg", "03.png"],
    live: "https://github.com/tuyendat09/Purrfect",
    github: "https://github.com/tuyendat09/Purrfect",
    skills: {
      frontend: [
        PROJECT_SKILLS.ts,
        PROJECT_SKILLS.next,
        PROJECT_SKILLS.tailwind,
        PROJECT_SKILLS.reactQuery,
      ],
      backend: [PROJECT_SKILLS.express, PROJECT_SKILLS.mongo],
    },
    get content() {
      return (
        <div>
          <TypographyP className="font-mono ">
            Welcome to the ultimate cat corner — a tiny but mighty place where
            cat lovers flood the feed with whiskers, toe beans, and way too many
            “aww” moments.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />
          <TypographyH3>Animated gatekeeper (built with GSAP!)</TypographyH3>
          <TypographyP className="font-mono">
            With all my passion (and probably too much coffee), this might be
            the funniest auth page I’ve ever built — powered by GSAP for those
            slick, over-the-top route transition animations.
          </TypographyP>
          <SlideShow
            images={[
              `${BASE_PATH}/purrfect/auth.png`,
              `${BASE_PATH}/purrfect/onboarding.png`,
            ]}
          />
          <TypographyH3> A cozy corner</TypographyH3>
          <TypographyP className="font-mono">
            This isn’t just a homepage — it’s a digital cat café. Grab a seat,
            post your cat’s best poses, and enjoy a never-ending feed of feline
            charm.
          </TypographyP>
          <SlideShow
            images={[
              `${BASE_PATH}/purrfect/home.png`,
              `${BASE_PATH}/purrfect/element-detail.png`,
            ]}
          />
          <TypographyH3> On working</TypographyH3>
          <TypographyP className="font-mono">
            This project isn’t finished yet — right now, I’m tinkering with AI
            magic: embeddings, AI-powered image curation, and visual search to
            make every cat pic instantly discoverable.
          </TypographyP>
        </div>
      );
    },
  },
];
export default projects;
