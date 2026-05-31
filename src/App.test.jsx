import { render, screen } from '@testing-library/react';
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

  // Footer
  expect(screen.getByRole('contentinfo')).toBeInTheDocument();
});
