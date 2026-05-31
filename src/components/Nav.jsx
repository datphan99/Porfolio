import { useState } from 'react';
import { navLinks, profile } from '../data/portfolio.js';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="container">
        <nav>
          <a href="#" className="brand">{profile.name}</a>

          <button
            className={`nav-burger${open ? ' is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>

          {open && (
            <div
              className="nav-scrim"
              aria-hidden="true"
              onClick={() => setOpen(false)}
            />
          )}

          <aside
            className={`nav-panel${open ? ' is-open' : ''}`}
            role="dialog"
            aria-label="Navigation menu"
          >
            <ul className="nav-menu">
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} onClick={() => setOpen(false)}>{label}</a>
                </li>
              ))}
            </ul>

            <div className="nav-socials">
              <a href={`mailto:${profile.email}`} aria-label="Email">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" />
                </svg>
              </a>
              <a href="#" aria-label="Figma">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3H9a3 3 0 0 0 0 6h3m0-6h3a3 3 0 0 1 0 6h-3m0-6v6m0 0H9a3 3 0 0 0 0 6h3v-6zm0 6v3a3 3 0 1 1-3-3h3zm0-6h0a3 3 0 1 0 3 3 3 3 0 0 0-3-3z" />
                </svg>
              </a>
            </div>
          </aside>
        </nav>
      </div>
    </header>
  );
}
