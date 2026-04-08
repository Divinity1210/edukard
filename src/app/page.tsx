"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={s.page}>
      {/* ─── Hero ─── */}
      <div style={s.heroBg}>
        {/* Full-bleed background image */}
        <div style={s.heroImageBg} />
        <div style={s.heroImageGradient} />
        <div style={s.heroGlowOrb} />
        <div style={s.heroGlowOrb2} />

        <header style={s.header}>
          <div style={s.logo}>
            <img src="/images/edukard-logo.png" alt="EduKard" style={s.logoImg} />
          </div>
          <nav style={s.nav}>
            <a href="#how" style={s.navLink}>How it Works</a>
            <a href="#portals" style={s.navLink}>Solutions</a>
            <a href="#faq" style={s.navLink}>FAQ</a>
            <button style={s.navLinkBtn} onClick={() => router.push("/login")}>Sign In</button>
            <button style={s.ctaBtn} onClick={() => router.push("/signup")}>Get Started</button>
          </nav>
        </header>

        <div style={s.heroContent}>
          <div style={s.badge}><span style={s.badgeDot} />Now available in Canada</div>
          <h1 style={s.heroTitle}>3 Clicks.<br /><span style={s.heroGradient}>Tuition Covered.</span></h1>
          <p style={s.heroSub}>Instant tuition financing for international students — powered by your payroll, not your credit score. Funds go directly to your university.</p>
          <div style={s.heroCtas}>
            <button style={s.primaryBtn} onClick={() => router.push("/signup")}>Apply for Financing →</button>
            <button style={s.secondaryBtn} onClick={() => router.push("/signup?role=investor")}>Invest in Education →</button>
          </div>
          <div style={s.heroTrust}>
            {["🔒 Bank-level encryption", "🏛️ OSC compliant", "⚡ 24h average approval", "🎯 Direct-to-university"].map((t) => (
              <span key={t} style={s.heroTrustItem}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Stats ─── */}
      <section style={s.statsSection}>
        <div style={s.statsInner}>
          {[
            { label: "Funded to students", value: "$12.4M", icon: "💰" },
            { label: "Active borrowers", value: "847", icon: "🎓" },
            { label: "Default rate", value: "2.1%", icon: "📊" },
            { label: "Avg. approval time", value: "<24h", icon: "⚡" },
          ].map((stat) => (
            <div key={stat.label} style={{ ...s.statCard, ...(hoveredCard === stat.label ? s.statCardHover : {}) }} onMouseEnter={() => setHoveredCard(stat.label)} onMouseLeave={() => setHoveredCard(null)}>
              <span style={s.statIcon}>{stat.icon}</span>
              <span style={s.statValue}>{stat.value}</span>
              <span style={s.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── The Problem ─── */}
      <section style={s.problemSection}>
        <div style={s.sectionInner}>
          <div style={s.problemGrid}>
            <div style={s.problemLeft}>
              <span style={s.tagline}>THE PROBLEM</span>
              <h2 style={s.sectionTitle2}>International students are <span style={{ color: "#EF4444" }}>credit invisible</span></h2>
              <p style={s.problemText}>Over 800,000 international students study in Canada each year. Despite being employed, they can&apos;t access traditional student loans because they lack local credit history. Banks reject them. Private lenders charge predatory rates.</p>
              <p style={s.problemText}>Students face 3-4 week delays, sky-high rejection rates, and the constant stress of a &quot;tuition gap&quot; — the time between when fees are due and when financing arrives.</p>
            </div>
            <div style={s.problemRight}>
              {[
                { icon: "❌", stat: "73%", label: "of international students denied by banks" },
                { icon: "⏱️", stat: "3-4 weeks", label: "average traditional loan processing time" },
                { icon: "📉", stat: "0", label: "credit score recognized from home country" },
              ].map((item) => (
                <div key={item.label} style={s.problemStat}>
                  <div style={s.problemStatIcon}>{item.icon}</div>
                  <div><div style={s.problemStatValue}>{item.stat}</div><div style={s.problemStatLabel}>{item.label}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section id="how" style={s.howSection}>
        <div style={s.sectionInner}>
          <span style={s.tagline}>HOW IT WORKS</span>
          <h2 style={s.sectionTitle}>From application to disbursement in 24 hours</h2>
          <p style={s.sectionSub}>No credit score. No collateral. Just your employment income.</p>
          <div style={s.stepsGrid}>
            {[
              { step: "01", title: "Verify your identity", desc: "Quick KYC with your government ID + student credentials. We use Sumsub for bank-level identity verification with liveness detection.", color: "#10B981", icon: "🪪" },
              { step: "02", title: "Connect your employer", desc: "Securely link your payroll via Plaid or Argyle. We verify your last 3-6 months of income — read-only, encrypted, consent-based.", color: "#14B8A6", icon: "🏦" },
              { step: "03", title: "Get your EduKard Score", desc: "Our algorithm calculates your debt-to-income ratio and generates an instant EduKard Score. No credit bureau pull required.", color: "#8B5CF6", icon: "⚡" },
              { step: "04", title: "Funds sent to university", desc: "Approved funds are routed directly to your university's bursar account. Zero risk of misuse. You sign digitally, we handle the rest.", color: "#3B82F6", icon: "🎓" },
            ].map((item) => (
              <div key={item.step} style={s.stepCard}>
                <div style={{ ...s.stepNumber, background: `${item.color}15`, color: item.color, boxShadow: `0 0 15px ${item.color}10` }}>{item.step}</div>
                <div style={s.stepIcon}>{item.icon}</div>
                <h3 style={s.stepTitle}>{item.title}</h3>
                <p style={s.stepDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why EduKard ─── */}
      <section style={s.whySection}>
        <div style={s.sectionInner}>
          <span style={s.tagline}>WHY EDUKARD</span>
          <h2 style={s.sectionTitle}>Built different, by design</h2>
          <div style={s.whyGrid}>
            {[
              { icon: "🔐", title: "No Credit Score Required", desc: "We underwrite based on your payroll income, not your credit history. International students finally have a fair path." },
              { icon: "🏫", title: "Direct-to-University", desc: "Funds never touch the student's wallet. We send them straight to the bursar, eliminating fraud risk entirely." },
              { icon: "⚡", title: "24-Hour Approval", desc: "Our algorithmic engine processes applications in hours, not weeks. Connect payroll and get a decision the same day." },
              { icon: "📊", title: "Transparent Pricing", desc: "Fixed APR with no hidden fees. See your full amortization schedule before you sign — principal, interest, total cost." },
              { icon: "🤖", title: "Automated Repayments", desc: "Set up Pre-Authorized Debit once. Payments are automatically pulled each month with calendar reminders." },
              { icon: "🛡️", title: "Blockchain-Secured", desc: "Every transaction is recorded on-chain. Investors and regulators can verify reserves in real time through our transparency page." },
            ].map((item) => (
              <div key={item.title} style={s.whyCard}>
                <div style={s.whyIconWrap}>{item.icon}</div>
                <h3 style={s.whyCardTitle}>{item.title}</h3>
                <p style={s.whyCardDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Ecosystem / Portals ─── */}
      <section id="portals" style={s.portalsSection}>
        <div style={s.sectionInner}>
          <span style={s.tagline}>ECOSYSTEM</span>
          <h2 style={s.sectionTitle}>One platform, four stakeholders</h2>
          <p style={s.sectionSub}>EduKard connects every participant in the international student financing ecosystem.</p>
          <div style={s.portalCards}>
            {[
              { img: "/images/student-studying.png", icon: "🎓", title: "Students", desc: "Apply for tuition financing in minutes. Track your loan, repayments, and documents all in one place.", features: ["Income-based underwriting", "Transparent APR & amortization", "Automated PAD repayments", "Full document portal"], color: "#10B981", cta: "Apply Now", href: "/signup" },
              { img: "/images/investor-growth.png", icon: "📈", title: "Investors", desc: "Earn stable, RWA-backed yield from a diversified pool of student tuition repayments.", features: ["Senior tranche: ~8% targeted APY", "Junior tranche: ~14% targeted APY", "Real-time yield dashboard", "Proof of reserve transparency"], color: "#14B8A6", cta: "Start Investing", href: "/signup?role=investor" },
              { img: "/images/university-campus.png", icon: "🏛️", title: "Universities", desc: "Receive guaranteed tuition payments directly. Verify student enrollment and track settlement batches.", features: ["Bulk invoice upload", "Automated student matching", "Real-time settlement tracking", "Direct CAD/USDC disbursement"], color: "#F59E0B", cta: "Partner With Us", href: "/signup?role=university" },
              { img: "/images/agent-partnership.png", icon: "🤝", title: "Education Agents", desc: "Earn commissions by connecting your students to EduKard's financing platform.", features: ["Referral link tracking", "Real-time loan status updates", "Monthly commission payouts", "Dedicated partner dashboard"], color: "#EC4899", cta: "Become a Partner", href: "/signup?role=agent" },
            ].map((portal) => (
              <div key={portal.title} style={{ ...s.portalCard, borderTop: `3px solid ${portal.color}` }}>
                <div style={s.portalImgWrap}>
                  <img src={portal.img} alt={portal.title} style={s.portalImg} />
                  <div style={s.portalImgGrad} />
                </div>
                <div style={s.portalBody}>
                  <span style={s.portalIcon}>{portal.icon}</span>
                  <h3 style={s.portalTitle}>{portal.title}</h3>
                  <p style={s.portalDesc}>{portal.desc}</p>
                  <ul style={s.portalList}>
                    {portal.features.map((f) => <li key={f} style={s.portalFeature}><span style={{ color: portal.color }}>✓</span> {f}</li>)}
                  </ul>
                  <button style={{ ...s.portalBtn, background: `linear-gradient(135deg, ${portal.color}, ${portal.color}CC)` }} onClick={() => router.push(portal.href)}>{portal.cta} →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Repayment ─── */}
      <section style={s.repaySection}>
        <div style={s.sectionInner}>
          <div style={s.repayGrid}>
            <div>
              <span style={s.tagline}>REPAYMENT</span>
              <h2 style={s.sectionTitle2}>Simple, predictable monthly payments</h2>
              <p style={s.repayText}>Once approved, you set up a one-time Pre-Authorized Debit. Every month, your fixed payment is automatically pulled — no manual work, no missed deadlines.</p>
              <div style={s.repayCard}>
                <div style={s.repayRow}><span style={s.repayLabel}>Example Tuition Loan</span><span style={s.repayValue}>$15,500 CAD</span></div>
                <div style={s.repayRow}><span style={s.repayLabel}>APR</span><span style={s.repayValue}>11.5%</span></div>
                <div style={s.repayRow}><span style={s.repayLabel}>Term</span><span style={s.repayValue}>24 months</span></div>
                <div style={{ ...s.repayRow, borderBottom: "none" }}><span style={s.repayLabel}>Monthly Payment</span><span style={{ ...s.repayValue, color: "#10B981", fontSize: "20px" }}>$726.84</span></div>
              </div>
            </div>
            <div style={s.repayFeatures}>
              {[
                { icon: "📅", title: "Calendar reminders", desc: "Get notified 3 days before each payment via email and SMS." },
                { icon: "💳", title: "Auto-debit", desc: "Payments are pulled automatically via Pre-Authorized Debit (PAD)." },
                { icon: "📊", title: "Full transparency", desc: "View your complete amortization schedule — principal vs. interest breakdown for every single payment." },
                { icon: "🛡️", title: "No prepayment penalty", desc: "Pay off your loan early at any time with zero extra charges." },
              ].map((feat) => (
                <div key={feat.title} style={s.repayFeat}>
                  <span style={s.repayFeatIcon}>{feat.icon}</span>
                  <div><div style={s.repayFeatTitle}>{feat.title}</div><div style={s.repayFeatDesc}>{feat.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" style={s.faqSection}>
        <div style={s.sectionInner}>
          <span style={s.tagline}>FAQ</span>
          <h2 style={s.sectionTitle}>Common questions</h2>
          <div style={s.faqList}>
            {[
              { q: "Do I need a Canadian credit score?", a: "No. EduKard uses your payroll and employment income to underwrite your loan — not a credit score. As long as you're employed and enrolled in a designated learning institution (DLI), you can apply." },
              { q: "Where do the funds go?", a: "Funds are disbursed directly to your university's bursar account. They never touch your personal wallet, which eliminates fraud risk and ensures your tuition is paid." },
              { q: "How long does approval take?", a: "Most applications are processed within 24 hours. Once you connect your payroll and verify your identity, our algorithm generates an instant EduKard Score." },
              { q: "What are the interest rates?", a: "We offer competitive fixed APRs based on your EduKard Score. You'll see the exact rate, monthly payment, and full amortization schedule before signing anything." },
              { q: "How do investors earn yield?", a: "Investors deposit capital into our liquidity pool, which is deployed as student tuition loans. As students repay monthly, yield is distributed. We offer Senior Tranche (~8% APY, lower risk) and Junior Tranche (~14% APY, higher risk) options." },
              { q: "Is EduKard regulated?", a: "Yes. EduKard operates in compliance with Ontario Securities Commission (OSC) guidelines for digital asset-backed lending. All smart contracts are audited, and reserves are provable on-chain." },
            ].map((faq, i) => (
              <div key={i} style={s.faqItem}>
                <button style={s.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{ ...s.faqChev, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                </button>
                {openFaq === i && <div style={s.faqA}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>Ready to cover your tuition?</h2>
          <p style={s.ctaSub}>Join hundreds of international students who&apos;ve already unlocked fast, fair tuition financing through EduKard.</p>
          <div style={s.ctaBtns}>
            <button style={s.ctaPrimary} onClick={() => router.push("/signup")}>Start Your Application →</button>
            <button style={s.ctaSecondary} onClick={() => router.push("/login")}>Sign In</button>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerTop}>
            <div>
              <div style={s.logo}><img src="/images/edukard-logo.png" alt="EduKard" style={s.footerLogoImg} /></div>
              <p style={s.footerAbout}>Tuition financing powered by payroll, built on blockchain transparency. A product of Arkad Technologies.</p>
            </div>
            <div style={s.footerCols}>
              <div>
                <div style={s.footerColTitle}>Platform</div>
                <a href="/signup" style={s.footerLink}>Apply for Financing</a>
                <a href="/signup?role=investor" style={s.footerLink}>Invest</a>
                <a href="/login" style={s.footerLink}>Sign In</a>
              </div>
              <div>
                <div style={s.footerColTitle}>Company</div>
                <a href="/about" style={s.footerLink}>About Arkad</a>
                <a href="/privacy" style={s.footerLink}>Privacy Policy</a>
                <a href="/terms" style={s.footerLink}>Terms of Service</a>
              </div>
              <div>
                <div style={s.footerColTitle}>Resources</div>
                <a href="#faq" style={s.footerLink}>FAQ</a>
                <a href="#how" style={s.footerLink}>How it Works</a>
                <a href="/contact" style={s.footerLink}>Contact Us</a>
              </div>
            </div>
          </div>
          <div style={s.footerDivider} />
          <div style={s.footerBottom}>
            <p style={s.copyright}>© 2026 Arkad Technologies Inc. All rights reserved. Toronto, Canada.</p>
            <p style={s.footerDisclaimer}>EduKard is a financial technology product. Lending is subject to credit assessment and eligibility criteria. Investments carry risk.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  // Page
  page: { minHeight: "100vh", background: "#0A0F1E", color: "#F9FAFB" },

  // Hero
  heroBg: { position: "relative", overflow: "hidden", paddingBottom: "80px" },
  heroImageBg: { position: "absolute", top: 0, right: 0, width: "55%", height: "100%", backgroundImage: "url(/images/hero-students.png)", backgroundSize: "cover", backgroundPosition: "center 20%", zIndex: 0 },
  heroImageGradient: { position: "absolute", top: 0, right: 0, width: "55%", height: "100%", background: "linear-gradient(90deg, #0A0F1E 0%, rgba(10,15,30,0.7) 40%, rgba(10,15,30,0.3) 70%, rgba(10,15,30,0.5) 100%)", zIndex: 1 },
  heroGlowOrb: { position: "absolute", top: "-150px", left: "20%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)", pointerEvents: "none", zIndex: 1 },
  heroGlowOrb2: { position: "absolute", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)", pointerEvents: "none", zIndex: 1 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", maxWidth: "1400px", margin: "0 auto", position: "relative" as const, zIndex: 10 },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoImg: { height: "48px", objectFit: "contain" as const, flexShrink: 0 },
  footerLogoImg: { height: "56px", objectFit: "contain" as const, flexShrink: 0 },
  nav: { display: "flex", alignItems: "center", gap: "8px" },
  navLink: { color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 500, padding: "8px 14px", textDecoration: "none", cursor: "pointer" },
  navLinkBtn: { color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 500, padding: "8px 16px", cursor: "pointer", background: "none", border: "none" },
  ctaBtn: { background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, padding: "10px 22px", borderRadius: "10px", border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  heroContent: { maxWidth: "640px", padding: "100px 48px 0", position: "relative" as const, zIndex: 5 },
  badge: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "100px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#10B981", fontSize: "13px", fontWeight: 600, marginBottom: "24px" },
  badgeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #059669)", display: "inline-block" },
  heroTitle: { fontSize: "clamp(42px, 5vw, 68px)", fontWeight: 800, lineHeight: 1.08, color: "#F9FAFB", marginBottom: "20px", letterSpacing: "-2px" },
  heroGradient: { background: "linear-gradient(135deg, #10B981, #14B8A6, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: "18px", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", marginBottom: "36px" },
  heroCtas: { display: "flex", gap: "14px", flexWrap: "wrap" as const, marginBottom: "40px" },
  primaryBtn: { display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 700, padding: "14px 28px", borderRadius: "12px", border: "none", cursor: "pointer", boxShadow: "0 0 30px rgba(16,185,129,0.25)" },
  secondaryBtn: { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: 600, padding: "14px 28px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", backdropFilter: "blur(10px)" },
  heroTrust: { display: "flex", flexWrap: "wrap" as const, gap: "16px" },
  heroTrustItem: { fontSize: "13px", color: "rgba(255,255,255,0.4)", fontWeight: 500 },

  // Stats
  statsSection: { padding: "48px 48px", background: "rgba(17,24,39,0.5)", borderTop: "1px solid rgba(75,85,99,0.15)", borderBottom: "1px solid rgba(75,85,99,0.15)" },
  statsInner: { maxWidth: "1400px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
  statCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.2)", borderRadius: "16px", padding: "24px", textAlign: "center" as const, transition: "all 0.3s ease", cursor: "default" },
  statCardHover: { borderColor: "rgba(16,185,129,0.3)", transform: "translateY(-3px)", boxShadow: "0 0 25px rgba(16,185,129,0.1)" },
  statIcon: { display: "block", fontSize: "28px", marginBottom: "8px" },
  statValue: { display: "block", fontSize: "28px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  statLabel: { display: "block", fontSize: "13px", color: "#6B7280", marginTop: "4px" },

  // Problem
  problemSection: { padding: "100px 48px", background: "#0A0F1E" },
  sectionInner: { maxWidth: "1400px", margin: "0 auto" },
  tagline: { display: "inline-block", fontSize: "12px", fontWeight: 700, color: "#10B981", letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: "12px" },
  sectionTitle2: { fontSize: "32px", fontWeight: 800, color: "#F9FAFB", lineHeight: 1.2, marginBottom: "20px", letterSpacing: "-0.5px" },
  problemGrid: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "60px", alignItems: "center" },
  problemLeft: {},
  problemText: { fontSize: "16px", lineHeight: 1.8, color: "#9CA3AF", marginBottom: "16px" },
  problemRight: { display: "flex", flexDirection: "column" as const, gap: "16px" },
  problemStat: { display: "flex", alignItems: "center", gap: "16px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "14px", padding: "20px 24px" },
  problemStatIcon: { fontSize: "28px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.08)", borderRadius: "12px", flexShrink: 0 },
  problemStatValue: { fontSize: "24px", fontWeight: 800, color: "#F9FAFB" },
  problemStatLabel: { fontSize: "14px", color: "#6B7280", marginTop: "2px" },

  // How it Works
  howSection: { padding: "100px 48px", background: "linear-gradient(180deg, rgba(17,24,39,0.3) 0%, #0A0F1E 100%)" },
  sectionTitle: { fontSize: "32px", fontWeight: 800, color: "#F9FAFB", marginBottom: "8px", textAlign: "center" as const, letterSpacing: "-0.5px" },
  sectionSub: { fontSize: "16px", color: "#6B7280", textAlign: "center" as const, marginBottom: "56px" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" },
  stepCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.2)", borderRadius: "16px", padding: "32px 28px" },
  stepNumber: { display: "inline-flex", width: "40px", height: "40px", borderRadius: "10px", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, marginBottom: "16px", fontFamily: "monospace" },
  stepIcon: { fontSize: "32px", marginBottom: "12px" },
  stepTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "10px" },
  stepDesc: { fontSize: "14px", lineHeight: 1.7, color: "#6B7280" },

  // Why
  whySection: { padding: "100px 48px", background: "#0A0F1E" },
  whyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginTop: "56px" },
  whyCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.2)", borderRadius: "16px", padding: "32px 28px" },
  whyIconWrap: { fontSize: "32px", marginBottom: "16px" },
  whyCardTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" },
  whyCardDesc: { fontSize: "14px", lineHeight: 1.7, color: "#6B7280" },

  // Portals
  portalsSection: { padding: "100px 48px", background: "linear-gradient(180deg, rgba(17,24,39,0.3) 0%, #0A0F1E 100%)" },
  portalCards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
  portalCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.2)", borderRadius: "16px", overflow: "hidden" },
  portalImgWrap: { position: "relative" as const, height: "160px", overflow: "hidden" },
  portalImg: { width: "100%", height: "100%", objectFit: "cover" as const },
  portalImgGrad: { position: "absolute" as const, bottom: 0, left: 0, right: 0, height: "80%", background: "linear-gradient(transparent, rgba(17,24,39,1))", pointerEvents: "none" as const },
  portalBody: { padding: "24px 28px 28px" },
  portalIcon: { fontSize: "28px", marginBottom: "8px", display: "block" },
  portalTitle: { fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" },
  portalDesc: { fontSize: "14px", lineHeight: 1.7, color: "#6B7280", marginBottom: "16px" },
  portalList: { listStyle: "none", padding: 0, marginBottom: "24px", display: "flex", flexDirection: "column" as const, gap: "6px" },
  portalFeature: { fontSize: "13px", color: "#D1D5DB", display: "flex", gap: "8px" },
  portalBtn: { display: "inline-flex", padding: "10px 24px", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer" },

  // Repayment
  repaySection: { padding: "100px 48px", background: "#0A0F1E" },
  repayGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" },
  repayText: { fontSize: "16px", lineHeight: 1.8, color: "#9CA3AF", marginBottom: "28px" },
  repayCard: { background: "rgba(17,24,39,0.6)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "4px 0" },
  repayRow: { display: "flex", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(75,85,99,0.15)" },
  repayLabel: { fontSize: "14px", color: "#6B7280" },
  repayValue: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  repayFeatures: { display: "flex", flexDirection: "column" as const, gap: "20px" },
  repayFeat: { display: "flex", gap: "16px", alignItems: "flex-start" },
  repayFeatIcon: { fontSize: "24px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,0.08)", borderRadius: "12px", flexShrink: 0 },
  repayFeatTitle: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB", marginBottom: "4px" },
  repayFeatDesc: { fontSize: "13px", lineHeight: 1.6, color: "#6B7280" },

  // FAQ
  faqSection: { padding: "100px 48px", background: "linear-gradient(180deg, rgba(17,24,39,0.3) 0%, #0A0F1E 100%)" },
  faqList: { maxWidth: "800px", margin: "40px auto 0", display: "flex", flexDirection: "column" as const, gap: "8px" },
  faqItem: { background: "rgba(17,24,39,0.6)", border: "1px solid rgba(75,85,99,0.2)", borderRadius: "12px", overflow: "hidden" },
  faqQ: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: "none", border: "none", color: "#F9FAFB", fontSize: "15px", fontWeight: 600, cursor: "pointer", textAlign: "left" as const },
  faqChev: { fontSize: "18px", color: "#6B7280", transition: "transform 0.2s ease" },
  faqA: { padding: "0 24px 20px", fontSize: "14px", lineHeight: 1.7, color: "#9CA3AF" },

  // CTA
  ctaSection: { padding: "100px 48px", background: "#0A0F1E" },
  ctaInner: { maxWidth: "700px", margin: "0 auto", textAlign: "center" as const },
  ctaTitle: { fontSize: "36px", fontWeight: 800, color: "#F9FAFB", marginBottom: "16px", letterSpacing: "-1px" },
  ctaSub: { fontSize: "16px", color: "#6B7280", lineHeight: 1.7, marginBottom: "32px" },
  ctaBtns: { display: "flex", justifyContent: "center", gap: "16px" },
  ctaPrimary: { display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "16px", fontWeight: 700, padding: "16px 36px", borderRadius: "12px", border: "none", cursor: "pointer", boxShadow: "0 0 40px rgba(16,185,129,0.25)" },
  ctaSecondary: { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", fontSize: "16px", fontWeight: 600, padding: "16px 36px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" },

  // Footer
  footer: { background: "rgba(10,15,30,0.9)", borderTop: "1px solid rgba(75,85,99,0.15)" },
  footerInner: { maxWidth: "1400px", margin: "0 auto", padding: "60px 48px 40px" },
  footerTop: { display: "grid", gridTemplateColumns: "1.5fr 2fr", gap: "60px", marginBottom: "40px" },
  footerAbout: { fontSize: "14px", color: "#6B7280", lineHeight: 1.7, marginTop: "16px", maxWidth: "320px" },
  footerCols: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" },
  footerColTitle: { fontSize: "13px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px", letterSpacing: "0.5px" },
  footerLink: { display: "block", fontSize: "14px", color: "#6B7280", textDecoration: "none", marginBottom: "10px" },
  footerDivider: { height: "1px", background: "rgba(75,85,99,0.15)", marginBottom: "24px" },
  footerBottom: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: "16px" },
  copyright: { color: "#4B5563", fontSize: "13px" },
  footerDisclaimer: { color: "#374151", fontSize: "12px", maxWidth: "500px", textAlign: "right" as const },
};
