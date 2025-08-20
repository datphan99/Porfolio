import { Link } from "@/types";
const BASE_PATH = "/assets/projects-screenshots";

const links: Link[] = [
  {
    title: "Home",
    href: "/",
    thumbnail: `${BASE_PATH}/myportfolio/landing.png`,
  },

  {
    title: "Skills",
    href: "/#skills",
    thumbnail: `${BASE_PATH}/myportfolio/skill.png`,
  },
  {
    title: "Projects",
    href: "/#projects",
    thumbnail: `${BASE_PATH}/myportfolio/project-1.png`,
  },
];

export { links };
