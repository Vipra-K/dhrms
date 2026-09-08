import { useNavigate } from "react-router-dom";

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">
    <path d="M7.5 4.5 13 10l-5.5 5.5M4 10h9" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="public-icon">
    <path d="m11.5 4.5-5.5 5.5 5.5 5.5M6.5 10H16" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="portal-feature-icon">
    <path d="M12 3.5 19 6v5.4c0 4.4-2.8 7.8-7 9.1-4.2-1.3-7-4.7-7-9.1V6l7-2.5Z" />
    <path d="m8.8 12 2.1 2.1 4.5-4.6" />
  </svg>
);

const RecordsIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="portal-feature-icon">
    <rect x="5" y="3.5" width="14" height="17" rx="2" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
  </svg>
);

const roles = [
  {
    label: "Registration Officer",
    code: "R",
    description: "Register workers and maintain verified identities.",
    path: "/login/registration-officer",
  },
  {
    label: "Hospital",
    code: "H",
    description: "Manage workers, doctors and healthcare services.",
    path: "/login/hospital",
  },
  {
    label: "Doctor",
    code: "D",
    description: "Access assigned workers and clinical records.",
    path: "/login/doctor",
  },
  {
    label: "Worker",
    code: "W",
    description: "View your identity, profile and health records.",
    path: "/login/worker",
  },
];

const RoleLoginPicker = () => {
  const navigate = useNavigate();

  return (
    <div className="public-auth-shell portal-selection-page">
      <style>{`
        .portal-selection-page { --portal-ink: #101828; --portal-muted: #667085; --portal-line: #e4e7ec; --portal-accent: #4f46e5; --portal-accent-soft: #eef2ff; background: #f5f7fb; color: var(--portal-ink); }
        .portal-selection-page .public-auth-wrap { width: min(1180px, calc(100% - 48px)); min-height: min(720px, calc(100vh - 48px)); display: flex; align-items: center; }
        .portal-selection-page .portal-selection-card { width: 100%; min-height: 650px; display: grid; grid-template-columns: minmax(360px, .88fr) minmax(560px, 1.12fr); overflow: hidden; border: 1px solid #dfe3eb; border-radius: 28px; background: #fff; box-shadow: 0 24px 70px rgba(16,24,40,.10); }
        .portal-selection-page .portal-story { position: relative; padding: 52px; overflow: hidden; color: #fff; background: radial-gradient(circle at 80% 18%, rgba(99,102,241,.45), transparent 28%), linear-gradient(150deg,#10183b 0%,#151d4b 55%,#25256a 100%); }
        .portal-selection-page .portal-story::before { content: ""; position: absolute; width: 380px; height: 380px; right: -150px; top: 110px; border: 1px solid rgba(165,180,252,.25); border-radius: 50%; box-shadow: 0 0 0 44px rgba(165,180,252,.045), 0 0 0 90px rgba(165,180,252,.035); }
        .portal-selection-page .portal-story::after { content: ""; position: absolute; inset: auto -80px -130px 20px; height: 260px; background: radial-gradient(circle, rgba(129,140,248,.24), transparent 68%); pointer-events: none; }
        .portal-selection-page .portal-brand-row { position: relative; z-index: 2; display: inline-flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: -.02em; }
        .portal-selection-page .portal-brand-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg,#818cf8,#4f46e5); box-shadow: 0 10px 25px rgba(79,70,229,.35); }
        .portal-selection-page .portal-brand-name { font-size: 17px; }
        .portal-selection-page .portal-story-content { position: relative; z-index: 2; max-width: 420px; margin-top: 108px; }
        .portal-selection-page .portal-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 18px; padding: 7px 11px; border: 1px solid rgba(199,210,254,.22); border-radius: 999px; background: rgba(255,255,255,.07); color: #c7d2fe; font-size: 11px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
        .portal-selection-page .portal-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: #a5b4fc; box-shadow: 0 0 0 4px rgba(165,180,252,.12); }
        .portal-selection-page .portal-story h2 { margin: 0; max-width: 430px; color: #fff; font-size: clamp(34px, 4vw, 48px); line-height: 1.05; letter-spacing: -.045em; }
        .portal-selection-page .portal-story-copy { margin: 18px 0 0; max-width: 390px; color: #c5cbe0; font-size: 15px; line-height: 1.7; }
        .portal-selection-page .portal-features { display: grid; gap: 12px; margin-top: 34px; }
        .portal-selection-page .portal-feature { display: flex; align-items: center; gap: 12px; color: #e8ebf7; font-size: 13px; }
        .portal-selection-page .portal-feature-icon { width: 20px; height: 20px; flex: 0 0 auto; fill: none; stroke: #a5b4fc; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
        .portal-selection-page .portal-decoration { position: absolute; z-index: 1; right: 54px; top: 198px; width: 116px; height: 116px; border: 1px solid rgba(199,210,254,.25); border-radius: 24px; transform: rotate(18deg); background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.02)); box-shadow: inset 0 0 30px rgba(165,180,252,.08); }
        .portal-selection-page .portal-decoration::before, .portal-selection-page .portal-decoration::after { content: ""; position: absolute; background: rgba(165,180,252,.42); }
        .portal-selection-page .portal-decoration::before { width: 1px; height: 170px; left: 56px; top: -28px; transform: rotate(-45deg); }
        .portal-selection-page .portal-decoration::after { height: 1px; width: 170px; left: -28px; top: 56px; transform: rotate(-45deg); }
        .portal-selection-page .portal-main { position: relative; padding: 48px 58px 42px; background: #fff; }
        .portal-selection-page .portal-back { position: absolute; top: 28px; right: 30px; }
        .portal-selection-page .portal-main-header { max-width: 560px; margin-top: 30px; }
        .portal-selection-page .portal-main-header h1 { margin: 14px 0 10px; color: #101828; font-size: clamp(31px, 3.4vw, 42px); line-height: 1.08; letter-spacing: -.04em; }
        .portal-selection-page .portal-main-header p { margin: 0; color: #667085; font-size: 14px; line-height: 1.6; }
        .portal-selection-page .portal-main-kicker { display: inline-flex; align-items: center; gap: 8px; color: #4f46e5; font-size: 11px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
        .portal-selection-page .portal-main-kicker::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 0 4px #eef2ff; }
        .portal-selection-page .portal-role-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin-top: 30px; }
        .portal-selection-page .portal-role-card { min-height: 112px; display: grid; grid-template-columns: 46px 1fr 24px; align-items: center; gap: 14px; padding: 18px; border: 1px solid #e4e7ec; border-radius: 16px; background: #fff; color: #101828; text-align: left; cursor: pointer; transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease; }
        .portal-selection-page .portal-role-card:hover { transform: translateY(-2px); border-color: #c7d2fe; background: #fafaff; box-shadow: 0 12px 28px rgba(16,24,40,.08); }
        .portal-selection-page .portal-role-card:focus-visible, .portal-selection-page .portal-register:focus-visible, .portal-selection-page .portal-back:focus-visible { outline: 3px solid rgba(99,102,241,.25); outline-offset: 3px; }
        .portal-selection-page .portal-role-icon { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 13px; background: #f0f2ff; color: #4f46e5; font-size: 16px; font-weight: 800; }
        .portal-selection-page .portal-role-card strong { display: block; font-size: 14px; line-height: 1.25; }
        .portal-selection-page .portal-role-card small { display: block; margin-top: 6px; color: #667085; font-size: 11.5px; line-height: 1.45; }
        .portal-selection-page .portal-role-arrow { display: grid; place-items: center; color: #98a2b3; transition: color .18s ease, transform .18s ease; }
        .portal-selection-page .portal-role-card:hover .portal-role-arrow { color: #4f46e5; transform: translateX(2px); }
        .portal-selection-page .portal-register { width: 100%; min-height: 78px; display: grid; grid-template-columns: 44px 1fr 24px; align-items: center; gap: 14px; margin-top: 14px; padding: 14px 16px; border: 1px dashed #c7d2fe; border-radius: 16px; background: #f8f9ff; color: #101828; text-align: left; cursor: pointer; transition: background .18s ease, border-color .18s ease, transform .18s ease; }
        .portal-selection-page .portal-register:hover { transform: translateY(-1px); border-color: #818cf8; background: #f2f4ff; }
        .portal-selection-page .portal-register-icon { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: #e9eaff; color: #4f46e5; font-size: 22px; font-weight: 500; }
        .portal-selection-page .portal-register strong { display: block; font-size: 13px; }
        .portal-selection-page .portal-register small { display: block; margin-top: 4px; color: #667085; font-size: 11.5px; line-height: 1.4; }
        .portal-selection-page .portal-register .public-icon { color: #4f46e5; }
        @media (max-width: 900px) { .portal-selection-page .portal-selection-card { grid-template-columns: 1fr; } .portal-selection-page .portal-story { min-height: 320px; padding: 34px; } .portal-selection-page .portal-story-content { margin-top: 54px; } .portal-selection-page .portal-decoration { right: 42px; top: 70px; } .portal-selection-page .portal-main { padding: 38px 34px; } }
        @media (max-width: 620px) { .portal-selection-page .public-auth-wrap { width: min(100% - 24px, 560px); min-height: auto; } .portal-selection-page .portal-selection-card { border-radius: 20px; } .portal-selection-page .portal-story { padding: 28px 24px; min-height: 300px; } .portal-selection-page .portal-story-content { margin-top: 42px; } .portal-selection-page .portal-story h2 { font-size: 32px; } .portal-selection-page .portal-decoration { right: 18px; top: 80px; width: 82px; height: 82px; } .portal-selection-page .portal-decoration::before { height: 120px; left: 40px; } .portal-selection-page .portal-decoration::after { width: 120px; top: 40px; } .portal-selection-page .portal-main { padding: 34px 22px 28px; } .portal-selection-page .portal-back { top: 18px; right: 18px; } .portal-selection-page .portal-main-header { margin-top: 24px; } .portal-selection-page .portal-role-grid { grid-template-columns: 1fr; margin-top: 24px; } .portal-selection-page .portal-role-card { min-height: 92px; } }
      `}</style>

      <div className="public-auth-wrap">
        <main className="portal-selection-card" aria-label="DHRMS portal selection">
          <section className="portal-story" aria-label="DHRMS introduction">
            <div className="portal-brand-row">
              <span className="portal-brand-mark">D</span>
              <span className="portal-brand-name">DHRMS</span>
            </div>

            <div className="portal-decoration" aria-hidden="true" />

            <div className="portal-story-content">
              <span className="portal-eyebrow"><span className="portal-eyebrow-dot" /> Digital health records</span>
              <h2>One secure system for every DHRMS role.</h2>
              <p className="portal-story-copy">
                Access the tools and records relevant to your responsibilities, with role-based access designed for secure healthcare workflows.
              </p>

              <div className="portal-features">
                <div className="portal-feature"><ShieldIcon /> Role-based access to protected records</div>
                <div className="portal-feature"><RecordsIcon /> A connected record for every worker</div>
              </div>
            </div>
          </section>

          <section className="portal-main">
            <button
              className="public-icon-btn portal-back"
              type="button"
              onClick={() => navigate("/")}
              title="Back to DHRMS home"
              aria-label="Back to DHRMS home"
            >
              <BackIcon />
            </button>

            <header className="portal-main-header">
              <span className="portal-main-kicker">Secure access</span>
              <h1>Select your DHRMS portal</h1>
              <p>Choose the role that matches your account to continue.</p>
            </header>

            <div className="portal-role-grid">
              {roles.map((role) => (
                <button
                  key={role.label}
                  className="portal-role-card"
                  type="button"
                  onClick={() => navigate(role.path)}
                  aria-label={`Continue as ${role.label}`}
                >
                  <span className="portal-role-icon" aria-hidden="true">{role.code}</span>
                  <span>
                    <strong>{role.label}</strong>
                    <small>{role.description}</small>
                  </span>
                  <span className="portal-role-arrow" aria-hidden="true"><ArrowIcon /></span>
                </button>
              ))}
            </div>

            <button
              className="portal-register"
              type="button"
              onClick={() => navigate("/hospital/register")}
              aria-label="Register a hospital"
            >
              <span className="portal-register-icon" aria-hidden="true">+</span>
              <span>
                <strong>Register a hospital</strong>
                <small>Create a hospital account and set up your DHRMS workspace.</small>
              </span>
              <ArrowIcon />
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RoleLoginPicker;
