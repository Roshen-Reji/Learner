"use client";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg:        #F4F6F0;
          --surface:   #FFFFFF;
          --surface2:  #EDEEE9;
          --border:    #DDE0D8;
          --green:     #2D6A4F;
          --green-mid: #40916C;
          --green-lt:  #D8EDDF;
          --teal:      #1B7A6E;
          --text:      #1C211A;
          --muted:     #717870;
          --radius:    14px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          font-size: 15px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        /* NAV */
        nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(244,246,240,0.88);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
        }

        .nav-inner {
          max-width: 1080px; margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .logo {
          font-family: 'Fraunces', serif;
          font-size: 20px; font-weight: 600;
          color: var(--text); text-decoration: none;
          display: flex; align-items: center; gap: 9px;
          letter-spacing: -0.01em;
        }

        .logo-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: var(--green);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: #fff; flex-shrink: 0;
        }

        .nav-links {
          display: flex; align-items: center; gap: 4px; list-style: none;
        }

        .nav-links a {
          color: var(--muted); text-decoration: none;
          font-size: 14px; font-weight: 500;
          padding: 7px 14px; border-radius: 8px;
          transition: background 0.18s, color 0.18s;
        }

        .nav-links a:hover { background: var(--surface2); color: var(--text); }

        .btn-login {
          background: var(--green) !important;
          color: #fff !important;
          padding: 8px 20px !important; border-radius: 8px !important;
          font-weight: 600 !important; font-size: 14px !important;
          transition: background 0.18s, transform 0.18s !important;
        }
        .btn-login:hover {
          background: var(--green-mid) !important;
          transform: translateY(-1px) !important;
        }

        /* Hamburger */
        .hamburger {
          display: none;
          flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 6px;
          border-radius: 8px;
        }
        .hamburger:hover { background: var(--surface2); }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--text); border-radius: 2px;
          transition: all 0.22s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .mobile-menu {
          display: none;
          flex-direction: column; gap: 2px;
          padding: 12px 16px 16px;
          border-top: 1px solid var(--border);
          background: rgba(244,246,240,0.97);
          backdrop-filter: blur(14px);
        }
        .mobile-menu.open { display: flex; }

        .mobile-menu a {
          color: var(--text); text-decoration: none;
          font-size: 16px; font-weight: 500;
          padding: 13px 16px; border-radius: 10px;
          transition: background 0.15s;
          display: block;
        }
        .mobile-menu a:hover { background: var(--surface2); }
        .mobile-menu .m-login {
          background: var(--green); color: #fff !important;
          font-weight: 600; text-align: center; margin-top: 8px;
        }
        .mobile-menu .m-login:hover { background: var(--green-mid) !important; }

        /* PAGE WRAP */
        .page { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

        /* HERO */
        .hero {
          padding: 72px 0 56px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--green-lt); color: var(--green);
          font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 5px 13px; border-radius: 100px;
          margin-bottom: 22px;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--green-mid);
        }

        .hero h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(38px, 5vw, 58px);
          font-weight: 500; line-height: 1.08;
          letter-spacing: -0.025em;
          color: var(--text); margin-bottom: 20px;
        }
        .hero h1 em { font-style: italic; color: var(--green); }

        .hero p {
          font-size: 16px; font-weight: 300;
          color: var(--muted); line-height: 1.75;
          margin-bottom: 36px;
        }

        .hero-btns {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--green); color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          padding: 13px 26px; border-radius: 10px;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(45,106,79,0.22);
        }
        .btn-primary:hover {
          background: var(--green-mid);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45,106,79,0.28);
        }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          color: var(--muted); font-size: 14px; font-weight: 500;
          text-decoration: none; padding: 13px 18px; border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-ghost:hover { border-color: var(--green); color: var(--green); }

        /* Hero Visual */
        .hero-visual { display: flex; justify-content: center; align-items: center; }

        .visual-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px;
          width: 100%; max-width: 320px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.07);
        }

        .vc-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 22px;
        }
        .vc-title {
          font-family: 'Fraunces', serif;
          font-size: 15px; font-weight: 500; color: var(--text);
        }
        .vc-badge {
          font-size: 11px; font-weight: 600;
          background: var(--green-lt); color: var(--green);
          padding: 3px 10px; border-radius: 100px;
        }

        .progress-list { display: flex; flex-direction: column; gap: 14px; }
        .prog-top {
          display: flex; justify-content: space-between;
          font-size: 12.5px; font-weight: 500;
          color: var(--text); margin-bottom: 7px;
        }
        .prog-top span:last-child { color: var(--muted); }
        .prog-track {
          height: 7px; background: var(--surface2);
          border-radius: 100px; overflow: hidden;
        }
        .prog-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, var(--green), var(--green-mid));
        }

        .vc-divider { border: none; border-top: 1px solid var(--border); margin: 22px 0; }

        .vc-streak { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }
        .streak-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: #FFF3E0;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .streak-val {
          font-family: 'Fraunces', serif;
          font-size: 18px; font-weight: 600; color: var(--text);
        }

        /* STATS */
        .stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin: 48px 0;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 22px 20px;
        }
        .stat-num {
          font-family: 'Fraunces', serif;
          font-size: 32px; font-weight: 500;
          color: var(--text); line-height: 1; margin-bottom: 5px;
        }
        .stat-num sup { font-size: 18px; color: var(--green-mid); }
        .stat-desc { font-size: 12px; font-weight: 500; color: var(--muted); }

        /* MODULES */
        .section-label {
          font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--green); margin-bottom: 10px;
        }
        .section-title {
          font-family: 'Fraunces', serif;
          font-size: 30px; font-weight: 500;
          color: var(--text); margin-bottom: 28px;
          letter-spacing: -0.02em;
        }

        .modules {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-bottom: 80px;
        }

        .mod-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 32px 28px;
          text-decoration: none;
          display: flex; flex-direction: column;
          transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
          position: relative; overflow: hidden;
        }
        .mod-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--green), var(--teal));
          opacity: 0; transition: opacity 0.25s;
          border-radius: 0 0 18px 18px;
        }
        .mod-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.09);
          border-color: rgba(45,106,79,0.2);
        }
        .mod-card:hover::after { opacity: 1; }

        .mod-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--green-lt);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 22px; flex-shrink: 0;
        }
        .mod-tag {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--green); margin-bottom: 8px;
        }
        .mod-title {
          font-family: 'Fraunces', serif;
          font-size: 22px; font-weight: 500;
          color: var(--text); margin-bottom: 10px;
          letter-spacing: -0.01em; line-height: 1.2;
        }
        .mod-desc {
          font-size: 13.5px; font-weight: 400;
          color: var(--muted); line-height: 1.7;
          flex: 1; margin-bottom: 24px;
        }
        .mod-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600;
          color: var(--green); text-decoration: none;
          transition: gap 0.2s;
        }
        .mod-card:hover .mod-link { gap: 10px; }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--border);
          padding: 28px 0;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        .footer-logo {
          font-family: 'Fraunces', serif;
          font-size: 17px; color: var(--text);
          font-weight: 500; letter-spacing: -0.01em;
          display: flex; align-items: center; gap: 8px;
        }
        .footer-lm {
          width: 24px; height: 24px; border-radius: 6px;
          background: var(--green);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: #fff;
        }
        .footer-copy { font-size: 12px; color: var(--muted); }

        /* MOBILE */
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .hamburger { display: flex; }

          .hero {
            grid-template-columns: 1fr;
            padding: 40px 0 36px;
            gap: 36px;
          }
          .hero-visual { order: -1; }
          .visual-card { max-width: 100%; }
          .hero h1 { font-size: 38px; }
          .hero p { font-size: 15px; }

          .stats { grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 32px 0; }

          .modules { grid-template-columns: 1fr; gap: 12px; margin-bottom: 56px; }
          .mod-card { padding: 24px 22px; }
          .mod-card:hover { transform: none; }

          footer { flex-direction: column; align-items: flex-start; }
        }

        @media (max-width: 400px) {
          .page { padding: 0 16px; }
          .nav-inner { padding: 0 16px; }
          .hero h1 { font-size: 33px; }
          .hero-btns { flex-direction: column; align-items: stretch; }
          .btn-primary, .btn-ghost { justify-content: center; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <span className="logo-mark">L</span>
            IEEE Learn
          </Link>

          <ul className="nav-links">
            <li><Link href="/aptitude">Aptitude</Link></li>
            <li><Link href="/placement">Placements</Link></li>
            <li><Link href="/roadmap">Roadmaps</Link></li>
            <li><Link href="/login" className="btn-login">Login</Link></li>
          </ul>

          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <Link href="/aptitude" onClick={() => setMenuOpen(false)}>⚡ Aptitude</Link>
          <Link href="/placement" onClick={() => setMenuOpen(false)}>💼 Placements</Link>
          <Link href="/roadmap" onClick={() => setMenuOpen(false)}>🗺️ Roadmaps</Link>
          <Link href="/login" className="m-login" onClick={() => setMenuOpen(false)}>Login →</Link>
        </div>
      </nav>

      <div className="page">
        {/* HERO */}
        <section className="hero">
          <div>
            <div className="hero-badge"><span className="badge-dot" />Now with AI Roadmaps</div>
            <h1>Study smarter,<br /><em>land faster.</em></h1>
            <p>
              Everything you need to crack placements — aptitude practice,
              curated job listings, and personalised learning paths, all in one place.
            </p>
            <div className="hero-btns">
              <Link href="/aptitude" className="btn-primary">Start Practicing →</Link>
              <Link href="/roadmap" className="btn-ghost">View Roadmaps</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="vc-header">
                <span className="vc-title">Your Progress</span>
                <span className="vc-badge">Week 3</span>
              </div>
              <div className="progress-list">
                {[
                  { label: "Logical Reasoning", pct: 78 },
                  { label: "Quantitative Aptitude", pct: 54 },
                  { label: "Verbal Ability", pct: 91 },
                ].map(({ label, pct }) => (
                  <div key={label}>
                    <div className="prog-top"><span>{label}</span><span>{pct}%</span></div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <hr className="vc-divider" />
              <div className="vc-streak">
                <div className="streak-icon">🔥</div>
                <div>
                  <div className="streak-val">14 days</div>
                  <div style={{ fontSize: 12 }}>current streak</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats">
          {[
            { num: "12", sup: "K+", desc: "Practice Questions" },
            { num: "340", sup: "+", desc: "Active Job Listings" },
            { num: "98", sup: "%", desc: "Placement Rate" },
            { num: "50", sup: "+", desc: "Learning Roadmaps" },
          ].map(({ num, sup, desc }) => (
            <div className="stat-card" key={desc}>
              <div className="stat-num">{num}<sup>{sup}</sup></div>
              <div className="stat-desc">{desc}</div>
            </div>
          ))}
        </div>

        {/* MODULES */}
        <p className="section-label">Modules</p>
        <h2 className="section-title">Pick where to begin</h2>
        <div className="modules">
          {[
            {
              href: "/aptitude", icon: "⚡", tag: "Practice",
              title: "Aptitude Engine",
              desc: "Sharpen logical, verbal and quant skills with focused 5-minute sprints and instant feedback on every answer.",
              cta: "Begin Practice"
            },
            {
              href: "/placement", icon: "💼", tag: "Opportunities",
              title: "Placements",
              desc: "Hand-curated internships and fresher roles filtered by your domain, skills, and preferred company type.",
              cta: "Browse Roles"
            },
            {
              href: "/roadmap", icon: "🗺️", tag: "Learning Paths",
              title: "Interactive Roadmaps",
              desc: "AI-generated pathways tailored to your goals, recalibrated daily as the industry evolves.",
              cta: "Explore Paths"
            },
          ].map(({ href, icon, tag, title, desc, cta }) => (
            <Link href={href} className="mod-card" key={href}>
              <div className="mod-icon">{icon}</div>
              <div className="mod-tag">{tag}</div>
              <div className="mod-title">{title}</div>
              <p className="mod-desc">{desc}</p>
              <span className="mod-link">{cta} →</span>
            </Link>
          ))}
        </div>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">
            <span className="footer-lm">L</span>
            Learn_Studio
          </div>
          <span className="footer-copy">© 2025 Learn Studio · All rights reserved</span>
        </footer>
      </div>
    </>
  );
}