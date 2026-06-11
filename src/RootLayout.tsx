import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MistProvider } from "./transition/MistTransition";
import Nav from "./pages/home/sections/Nav/Nav";

// Nav's reveal runs ScrollTrigger as soon as the layout mounts — before any
// lazy page chunk (where the full plugin sets are registered) has loaded — so
// the shared core plugin must be registered here. registerPlugin is idempotent.
gsap.registerPlugin(ScrollTrigger);

/* Persistent shell shared by every route: the site header stays mounted across
   navigations, and MistProvider supplies the fog page transition. Pages own
   their ScrollSmoother/theme; the Suspense fallback stays blank because route
   swaps happen under full fog. */
export default function RootLayout() {
  const { pathname } = useLocation();
  return (
    <MistProvider>
      <Nav linkBase={pathname === "/" ? "" : "/"} />
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </MistProvider>
  );
}
