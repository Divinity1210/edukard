"use client";

import DashboardLayout from "@/components/DashboardLayout";

const FAQ = [
  { q: "Repayment Help & Schedules", a: "View your full amortization schedule in the Payments section. Payments are automatically collected via PAD on the 1st of each month." },
  { q: "Loan Application Status", a: "After submitting your application, our underwriting team reviews it within 24 hours. You'll receive an email notification once a decision is made." },
  { q: "Updating Personal Information", a: "Navigate to Settings to update your address, phone number, or banking details. Changes to legal name require re-verification." },
  { q: "Security & Two-Factor Auth", a: "Enable 2FA in Settings for added security. We use bank-level 256-bit encryption for all data transmission." },
];

export default function SupportPage() {
  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <h1 style={s.title}>Help & Support</h1>
      <p style={s.subtitle}>Find answers to common questions or reach out to our support team.</p>

      {/* Contact cards — from Figma */}
      <div style={s.contactGrid}>
        <div style={s.contactCard}>
          <span style={s.contactIcon}>📧</span>
          <div style={s.contactTitle}>Email Us</div>
          <div style={s.contactMeta}>Response in 24h</div>
          <a href="mailto:support@edukard.ca" style={s.contactLink}>support@edukard.ca</a>
        </div>
        <div style={s.contactCard}>
          <span style={s.contactIcon}>📞</span>
          <div style={s.contactTitle}>Call Helpline</div>
          <div style={s.contactMeta}>Mon-Fri, 9am-6pm EST</div>
          <a href="tel:+18001234567" style={s.contactLink}>1-800-123-4567</a>
        </div>
      </div>

      {/* Common Topics — from Figma */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Common Topics</h2>
        <div style={s.faqList}>
          {FAQ.map((item) => (
            <details key={item.q} style={s.faqItem}>
              <summary style={s.faqQ}>{item.q}</summary>
              <p style={s.faqA}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Dispute card — from Figma */}
      <div style={s.disputeCard}>
        <div style={s.disputeIcon}>⚡</div>
        <div>
          <h3 style={s.disputeTitle}>Dispute a Transaction</h3>
          <p style={s.disputeDesc}>If you notice unauthorized activity or billing errors, our regulatory team is here to assist immediately.</p>
        </div>
        <button style={s.disputeBtn}>Start Dispute Process</button>
      </div>

      <div style={s.regulated}>
        <span style={s.regulatedIcon}>✓</span>
        REGULATED BY CANADIAN FINANCIAL AUTHORITIES
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px" },
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "28px" },
  contactCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", textAlign: "center" as const },
  contactIcon: { fontSize: "28px", display: "block", marginBottom: "8px" },
  contactTitle: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  contactMeta: { fontSize: "12px", color: "#6B7280", marginTop: "4px", marginBottom: "8px" },
  contactLink: { fontSize: "14px", color: "#10B981", fontWeight: 600, textDecoration: "none" },
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  faqList: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  faqItem: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "12px", overflow: "hidden" },
  faqQ: { padding: "16px 20px", fontSize: "14px", fontWeight: 600, color: "#F9FAFB", cursor: "pointer", listStyle: "none" },
  faqA: { padding: "0 20px 16px", fontSize: "14px", color: "#6B7280", lineHeight: 1.7 },
  disputeCard: { display: "flex", alignItems: "center", gap: "16px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", flexWrap: "wrap" as const },
  disputeIcon: { fontSize: "28px", flexShrink: 0 },
  disputeTitle: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  disputeDesc: { fontSize: "13px", color: "#6B7280", marginTop: "4px", lineHeight: 1.6 },
  disputeBtn: { padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0, marginLeft: "auto" },
  regulated: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "12px", fontWeight: 600, color: "#10B981", letterSpacing: "0.5px", textTransform: "uppercase" as const },
  regulatedIcon: { width: "18px", height: "18px", borderRadius: "50%", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#10B981" },
};
