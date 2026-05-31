import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import App from './App.jsx';

test('renders the portfolio shell', () => {
  render(<App />);

  // Nav is present
  expect(screen.getByRole('banner')).toBeInTheDocument();

  // Hero availability badge is controlled by JSON data.
  expect(screen.getByText(/Available to work/i)).toBeInTheDocument();
  expect(screen.queryByText(/Hi, I'm Tuyen Dat/i)).not.toBeInTheDocument();
  expect(document.querySelector('.hero-status-dot.is-available')).toBeInTheDocument();

  // Hero CTA
  expect(screen.getByRole('link', { name: /book a meeting/i })).toBeInTheDocument();

  expect(document.querySelector('.hero-bg')).toBeInTheDocument();
  expect(document.querySelectorAll('.hero-beam')).toHaveLength(5);
  expect(document.querySelector('.hero')?.nextElementSibling).not.toHaveClass('showcase');

  // Footer
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});

test('uses the requested neutral page background', () => {
  const css = readFileSync(`${process.cwd()}/src/styles.css`, 'utf8');

  expect(css).toMatch(/--bg:\s*#F2F2F0;/);
  expect(css).toMatch(/body\s*{[^}]*background:\s*var\(--bg\)/s);
  expect(css).toMatch(/\.hero\s*{[^}]*background:\s*var\(--bg\)/s);
});
