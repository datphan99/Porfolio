import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { readFileSync } from "node:fs";
import RootLayout from "./RootLayout";
import HomePage from "./pages/home/HomePage";
import { profile } from "./data/portfolio";

test("renders the portfolio shell", () => {
  // Render through RootLayout: the Nav lives there now (persists across routes).
  render(
    <MemoryRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  expect(screen.getByText("Dat Phan / Frontend Developer")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();

  // Night-haze footer: link columns + meta row (© line is split across nodes)
  const footer = screen.getByRole("contentinfo");
  // exact match: the big brand name (the © meta line is "© 2026 Dat Phan")
  expect(within(footer).getByText("Dat Phan")).toBeInTheDocument();
  expect(within(footer).getByText("Personal portfolio")).toBeInTheDocument();
  expect(within(footer).getByText("Fonts used")).toBeInTheDocument();
  expect(
    within(footer).getByRole("link", { name: "Email" }),
  ).toHaveAttribute("href", `mailto:${profile.email}`);
  expect(
    within(footer).getByRole("navigation", { name: /footer/i }),
  ).toBeInTheDocument();
});

test("defines the expected design tokens", () => {
  const css = readFileSync(`${process.cwd()}/src/styles.css`, "utf8");
  expect(css).toMatch(/--dot:\s*#ff3700;/);
  expect(css).toMatch(/--radius:\s*22px;/);
});
