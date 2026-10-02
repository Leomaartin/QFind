"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./Footer.css";

export default function Footer() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.isLight !== undefined) {
        setIsDark(!e.detail.isLight);
      } else {
        setIsDark(!document.body.classList.contains("LigthVersion"));
      }
    };
    setIsDark(!document.body.classList.contains("LigthVersion"));
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="qfind-footer">
      <div className="qfind-footer-glow" />

      <div className="qfind-footer-container">
        {/* Main Columns Grid */}
        <div className="qfind-footer-grid">
          {/* Column 1: QFind Brand */}
          <div className="qfind-footer-col qfind-brand-col">
            <Link href="/" className="qfind-footer-logo-link">
              <img
                src={isDark ? "/logo-white.png" : "/logo-dark.png"}
                alt="QFind Logo"
                className="qfind-footer-logo"
              />
            </Link>
            <p className="qfind-footer-tagline">
              Connecting communities with verified local businesses, top-tier professionals, and trusted services across the city.
            </p>

            <div className="qfind-system-status">
              <span className="status-ping" />
              <span className="status-text">QFind Services Online & Operational</span>
            </div>

            <div className="qfind-social-links">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="qfind-social-btn"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="qfind-social-btn"
                aria-label="LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="qfind-social-btn"
                aria-label="GitHub"
              >
                <i className="fa-brands fa-github"></i>
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                className="qfind-social-btn"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="qfind-footer-col">
            <h4 className="qfind-footer-heading">Explore</h4>
            <ul className="qfind-footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/viewService">Search Services</Link>
              </li>
              <li>
                <Link href="/results">Browse Categories</Link>
              </li>
              <li>
                <Link href="/viewService">Interactive City Map</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Businesses */}
          <div className="qfind-footer-col">
            <h4 className="qfind-footer-heading">For Businesses</h4>
            <ul className="qfind-footer-links">
              <li>
                <Link href="/crud">List Your Business</Link>
              </li>
              <li>
                <Link href="/viewService">Featured Promotion Plans</Link>
              </li>
              <li>
                <Link href="/admin">Administrative Portal</Link>
              </li>
              <li>
                <Link href="/crud">Manage Catalog (CRUD)</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Developer Showcase - SLdevs */}
          <div className="qfind-footer-col qfind-dev-col">
            <div className="sldevs-card">
              <div className="sldevs-card-glow" />
              <div className="sldevs-header">
                <span className="sldevs-badge">SOFTWARE AGENCY</span>
                <span className="sldevs-status-dot" title="Available for projects" />
              </div>

              <div className="sldevs-brand">
                <img
                  src={isDark ? "/sldevs-logo-white.png" : "/sldevs-logo-dark.png"}
                  alt="SLdevs Logo"
                  className="sldevs-logo-img"
                />
              </div>

              <p className="sldevs-pitch">
                Full-stack web application developed and maintained by <strong>SLdevs</strong>. Engineering scalable, high-performance digital experiences.
              </p>

              <div className="sldevs-tech-tags">
                <span className="tech-tag">Next.js</span>
                <span className="tech-tag">React</span>
                <span className="tech-tag">TypeScript</span>
                <span className="tech-tag">Tailored UI</span>
              </div>

              <a
                href="mailto:contact@sldevs.com?subject=Project%20Inquiry%20from%20QFind"
                className="sldevs-contact-btn"
              >
                <span>Hire SLdevs</span>
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="qfind-footer-bottom">
          <div className="qfind-copyright">
            <span>© {new Date().getFullYear()} QFind Directory. All rights reserved.</span>
            <span className="footer-separator">•</span>
            <span>
              Engineered with <span className="heart-icon">♥</span> by{" "}
              <a
                href="mailto:contact@sldevs.com"
                className="sldevs-bottom-link"
              >
                SLdevs
              </a>
            </span>
          </div>

          <button
            type="button"
            className="qfind-back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Scroll to top of page"
          >
            <span>Top</span>
            <i className="fa-solid fa-chevron-up"></i>
          </button>
        </div>
      </div>
    </footer>
  );
}
