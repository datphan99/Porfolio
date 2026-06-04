import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import HomePage from "./pages/home/HomePage";

test("renders the portfolio shell", () => {
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(screen.getByText("Dat Phan / Frontend Developer")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();

  const footer = screen.getByRole("contentinfo");
  expect(within(footer).getByText("Dat Phan")).toBeInTheDocument();
  expect(
    within(footer).getByRole("link", { name: /start a project/i }),
  ).toHaveAttribute("href", "mailto:hello@example.com");
});

test("defines the expected design tokens", () => {
  const css = readFileSync(`${process.cwd()}/src/styles.css`, "utf8");
  expect(css).toMatch(/--dot:\s*#ff3700;/);
  expect(css).toMatch(/--radius:\s*22px;/);
});
