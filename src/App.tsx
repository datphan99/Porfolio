import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./RootLayout";

// Route-level code-splitting: the case study doesn't pay for the home page's
// WebGL/particle bundle, and vice versa. Chunks load under the mist cover.
const HomePage = lazy(() => import("./pages/home/HomePage"));
const CaseStudyPage = lazy(() => import("./pages/case-study/CaseStudyPage"));

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/case-study/:id", element: <CaseStudyPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
