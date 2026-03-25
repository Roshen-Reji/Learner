import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --bg: #0b0e14;
          --surface: #111520;
          --surface-raised: #161b2a;
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.14);
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --text: #e8e4dc;
          --muted: #6e7491;
          --accent: #3d5aed;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          line-height: 1.6;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .grain {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.032;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        .mesh {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 60% 50% at 10% 20%, rgba(61,90,237,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 90% 80%, rgba(201,168,76,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(16,22,40,0.6) 0%, transparent 70%);
        }

        .wrapper {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ── NAV ── */
        nav {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 20px 0;
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(18px);
          background: rgba(11,14,20,0.72);
          margin-bottom: 0;
        }

        .nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: var(--text);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold);
          display: inline-block;
          box-shadow: 0 0 10px rgba(201,168,76,0.5);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }

        .nav-links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--text); }

        .btn-login {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--bg) !important;
          background: var(--gold);
          padding: 9px 22px;
          border-radius: 4px;
          text-decoration: none;
          transition: background 0.2s, box-shadow 0.2s !important;
          box-shadow: 0 0 20px rgba(201,168,76,0.18);
        }

        .btn-login:hover {
          background: var(--gold-light) !important;
          color: var(--bg) !important;
          box-shadow: 0 0 28px rgba(201,168,76,0.32) !important;
        }

        /* ── HERO ── */
        .hero {
          padding: 120px 0 80px;
          position: relative;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 28px;
        }

        .eyebrow-line {
          width: 36px;
          height: 1px;
          background: var(--gold);
          opacity: 0.6;
        }

        .hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 8vw, 88px);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: var(--text);
          margin-bottom: 28px;
          max-width: 780px;
        }

        .hero h1 em {
          font-style: italic;
          color: var(--gold-light);
        }

        .hero p {
          font-size: 16px;
          font-weight: 300;
          color: var(--muted);
          max-width: 480px;
          line-height: 1.75;
          margin-bottom: 44px;
        }

        .hero-cta {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--gold);
          color: var(--bg);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 14px 30px;
          border-radius: 4px;
          transition: all 0.25s;
          box-shadow: 0 8px 32px rgba(201,168,76,0.22);
        }

        .cta-primary:hover {
          background: var(--gold-light);
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(201,168,76,0.32);
        }

        .cta-arrow { font-size: 16px; transition: transform 0.2s; }
        .cta-primary:hover .cta-arrow { transform: translateX(4px); }

        .cta-secondary {
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.2s;
        }

        .cta-secondary:hover { color: var(--text); }

        /* ── STATS BAR ── */
        .stats-bar {
          display: flex;
          gap: 0;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          margin: 72px 0;
          background: var(--surface);
        }

        .stat {
          flex: 1;
          padding: 28px 32px;
          border-right: 1px solid var(--border);
          position: relative;
        }

        .stat:last-child { border-right: none; }

        .stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px;
          font-weight: 600;
          line-height: 1;
          color: var(--text);
          margin-bottom: 6px;
        }

        .stat-value span {
          color: var(--gold);
          font-size: 28px;
        }

        .stat-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* ── CARDS ── */
        .section-header {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 40px;
        }

        .section-tag {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          opacity: 0.8;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 400;
          color: var(--text);
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2px;
          background: var(--border);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 100px;
        }

        .card {
          background: var(--surface);
          padding: 40px 36px;
          text-decoration: none;
          display: block;
          position: relative;
          overflow: hidden;
          transition: background 0.3s;
          cursor: pointer;
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--gold), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .card:hover { background: var(--surface-raised); }
        .card:hover::before { opacity: 1; }

        .card-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.12em;
          color: var(--muted);
          margin-bottom: 36px;
        }

        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-bottom: 24px;
          transition: background 0.3s, border-color 0.3s;
        }

        .card:hover .card-icon {
          background: rgba(201,168,76,0.14);
          border-color: rgba(201,168,76,0.3);
        }

        .card h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 14px;
          line-height: 1.2;
        }

        .card p {
          font-size: 13.5px;
          font-weight: 300;
          color: var(--muted);
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .card-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          opacity: 0.7;
          transition: opacity 0.2s, gap 0.2s;
        }

        .card:hover .card-link {
          opacity: 1;
          gap: 12px;
        }

        /* ── FOOTER ── */
        footer {
          border-top: 1px solid var(--border);
          padding: 32px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          color: var(--muted);
          font-weight: 400;
          letter-spacing: 0.04em;
        }

        .footer-copy {
          font-size: 12px;
          color: var(--muted);
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .cards { grid-template-columns: 1fr; }
          .stats-bar { flex-direction: column; }
          .stat { border-right: none; border-bottom: 1px solid var(--border); }
          .stat:last-child { border-bottom: none; }
          .hero h1 { font-size: 48px; }
          .nav-links { gap: 16px; }
        }
      `}</style>

      <div className="grain" />
      <div className="mesh" />

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <a href="/" className="logo">
            <span className="logo-dot" />
            IEEE Learn
          </a>
          <ul className="nav-links">
            <li><Link href="/aptitude">Aptitude</Link></li>
            <li><Link href="/placement">Placements</Link></li>
            <li><Link href="/roadmap">Roadmaps</Link></li>
            <li><Link href="/login" className="btn-login">Login</Link></li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <div className="wrapper">
        <section className="hero">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />
            Modern Learning Platform
          </div>
          <h1>
            Sharpen your edge.<br />
            <em>Land your role.</em>
          </h1>
          <p>
            Structured aptitude training, curated placement opportunities,
            and AI-powered roadmaps — all in one focused studio.
          </p>
          <div className="hero-cta">
            <Link href="/aptitude" className="cta-primary">
              Start Learning <span className="cta-arrow">→</span>
            </Link>
            <Link href="/roadmap" className="cta-secondary">Explore Roadmaps</Link>
          </div>
        </section>

        {/* STATS */}
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-value">12<span>K+</span></div>
            <div className="stat-label">Practice Questions</div>
          </div>
          <div className="stat">
            <div className="stat-value">340<span>+</span></div>
            <div className="stat-label">Active Listings</div>
          </div>
          <div className="stat">
            <div className="stat-value">98<span>%</span></div>
            <div className="stat-label">Placement Rate</div>
          </div>
          <div className="stat">
            <div className="stat-value">24<span>/7</span></div>
            <div className="stat-label">AI Roadmaps</div>
          </div>
        </div>

        {/* CARDS */}
        <div className="section-header">
          <span className="section-tag">Modules</span>
          <span className="section-title">Where do you want to start?</span>
        </div>

        <div className="cards">
          <Link href="/aptitude" className="card">
            <div className="card-number">01 / 03</div>
            <div className="card-icon">⚡</div>
            <h2>Aptitude Engine</h2>
            <p>
              Sharpen logical reasoning with focused 5-minute sprints.
              Track your progress across topics and difficulty tiers.
            </p>
            <span className="card-link">Begin Practice →</span>
          </Link>

          <Link href="/placement" className="card">
            <div className="card-number">02 / 03</div>
            <div className="card-icon">💼</div>
            <h2>Placements</h2>
            <p>
              Hand-curated internships and fresher roles, filtered by your
              domain, skills, and preferred company type.
            </p>
            <span className="card-link">Browse Roles →</span>
          </Link>

          <Link href="/roadmap" className="card">
            <div className="card-number">03 / 03</div>
            <div className="card-icon">🗺️</div>
            <h2>Interactive Roadmaps</h2>
            <p>
              AI-generated learning pathways tailored to your goals,
              recalibrated daily as the industry evolves.
            </p>
            <span className="card-link">Explore Paths →</span>
          </Link>
        </div>

        {/* FOOTER */}
        <footer>
          <span className="footer-logo">Learn_Studio</span>
          <span className="footer-copy">© 2025 — All rights reserved</span>
        </footer>
      </div>
    </>
  );
}