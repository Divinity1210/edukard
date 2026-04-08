"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { MOCK_EMPLOYER_SEARCH, MOCK_PAYSLIPS } from "@/lib/mock-data";
import { formatCAD, formatDate } from "@/lib/calculations";

type ViewState = "connected" | "search";

export default function PayrollPage() {
  const [view, setView] = useState<ViewState>("connected");
  const [search, setSearch] = useState("");
  const [authorized, setAuthorized] = useState(true);
  const [consentDataSharing, setConsentDataSharing] = useState(true);
  const payslips = MOCK_PAYSLIPS;

  const filtered = MOCK_EMPLOYER_SEARCH.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const avgIncome = payslips.reduce((s, p) => s + p.net_pay, 0) / payslips.length;

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <h1 style={s.title}>Payroll Connection</h1>
      <p style={s.subtitle}>
        Connect your employer to verify income and enable automatic deductions.
      </p>

      {/* Trust Badges */}
      <div style={s.trustRow}>
        {[
          "🔒 Bank-level Encryption",
          "👁️ Read-only Access",
          "🛡️ PIPEDA Compliant",
          "🔗 Powered by Argyle",
        ].map((b) => (
          <span key={b} style={s.trustBadge}>
            {b}
          </span>
        ))}
      </div>

      {/* View Toggle */}
      <div style={s.tabRow}>
        <button
          onClick={() => setView("connected")}
          style={{ ...s.tab, ...(view === "connected" ? s.tabActive : {}) }}
        >
          Connected Employer
        </button>
        <button
          onClick={() => setView("search")}
          style={{ ...s.tab, ...(view === "search" ? s.tabActive : {}) }}
        >
          + Add / Change Employer
        </button>
      </div>

      {view === "connected" ? (
        <>
          {/* Connected Employer Card */}
          <div style={s.employerCard}>
            <div style={s.employerHeader}>
              <div style={s.employerIconWrap}>🍩</div>
              <div style={{ flex: 1 }}>
                <div style={s.employerName}>Tim Hortons — Yonge & Dundas</div>
                <div style={s.employerMeta}>
                  Connected via Argyle · Since Jan 2026 · Last synced 2h ago
                </div>
              </div>
              <span style={s.connectedBadge}>● Connected</span>
            </div>
            <div style={s.employerDetails}>
              <div>
                <span style={s.detLabel}>Position</span>
                <span style={s.detValue}>Shift Supervisor</span>
              </div>
              <div>
                <span style={s.detLabel}>Monthly Income</span>
                <span style={{ ...s.detValue, color: "#10B981" }}>
                  $3,200.00
                </span>
              </div>
              <div>
                <span style={s.detLabel}>Employment Duration</span>
                <span style={s.detValue}>14 months</span>
              </div>
              <div>
                <span style={s.detLabel}>Pay Frequency</span>
                <span style={s.detValue}>Bi-weekly</span>
              </div>
              <div>
                <span style={s.detLabel}>Direct Deposit</span>
                <span style={{ ...s.detValue, color: "#10B981" }}>
                  ✓ Verified
                </span>
              </div>
              <div>
                <span style={s.detLabel}>Avg. Net Pay</span>
                <span style={s.detValue}>{formatCAD(avgIncome)}</span>
              </div>
            </div>
          </div>

          {/* DATA SHARING CONSENT */}
          <div style={s.consentCard}>
            <label style={s.consentLabel}>
              <input
                type="checkbox"
                checked={consentDataSharing}
                onChange={(e) => setConsentDataSharing(e.target.checked)}
                style={s.checkbox}
              />
              <span style={s.consentText}>
                <strong>Consent to share payroll data</strong>
                <br />I authorize EduKard to access my payroll data in read-only
                mode for income verification and credit assessment purposes. I
                understand this data will be handled in compliance with PIPEDA
                and I can revoke access at any time.
              </span>
            </label>
          </div>

          {/* PAYSLIP HISTORY  */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>
              Recent Payslips ({payslips.length} periods)
            </h2>
            <div style={s.tableCard}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Pay Date", "Gross Pay", "Deductions", "Net Pay", "Hours"].map(
                      (h) => (
                        <th key={h} style={s.th}>
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((p) => (
                    <tr key={p.id}>
                      <td style={s.td}>{formatDate(p.pay_date)}</td>
                      <td style={{ ...s.td, fontWeight: 600 }}>
                        {formatCAD(p.gross_pay)}
                      </td>
                      <td style={{ ...s.td, color: "#EF4444" }}>
                        −{formatCAD(p.deductions)}
                      </td>
                      <td style={{ ...s.td, color: "#10B981", fontWeight: 700 }}>
                        {formatCAD(p.net_pay)}
                      </td>
                      <td style={s.td}>{p.hours_worked}h</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ ...s.td, fontWeight: 700, color: "#F9FAFB" }}>
                      Average
                    </td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#F9FAFB" }}>
                      {formatCAD(
                        payslips.reduce((s2, p) => s2 + p.gross_pay, 0) /
                          payslips.length
                      )}
                    </td>
                    <td style={s.td}>—</td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#10B981" }}>
                      {formatCAD(avgIncome)}
                    </td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#F9FAFB" }}>
                      {Math.round(
                        payslips.reduce(
                          (s2, p) => s2 + (p.hours_worked || 0),
                          0
                        ) / payslips.length
                      )}
                      h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* How it works */}
          <div style={s.section}>
            <h2 style={s.sectionTitle}>How payroll deduction works</h2>
            <div style={s.stepsRow}>
              {[
                {
                  icon: "🔗",
                  title: "Link your employer",
                  desc: "We verify your employment and income using a read-only payroll connection.",
                },
                {
                  icon: "📋",
                  title: "Set up payment plan",
                  desc: "Choose a flexible repayment plan aligned with your pay schedule.",
                },
                {
                  icon: "🔄",
                  title: "Automatic deductions",
                  desc: "Payments are automatically deducted from your pay — never miss a payment.",
                },
              ].map((step) => (
                <div key={step.title} style={s.stepCard}>
                  <div style={s.stepIcon}>{step.icon}</div>
                  <div style={s.stepTitle}>{step.title}</div>
                  <div style={s.stepDesc}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Authorization */}
          <div style={s.authCard}>
            <label style={s.authLabel}>
              <input
                type="checkbox"
                checked={authorized}
                onChange={(e) => setAuthorized(e.target.checked)}
                style={s.checkbox}
              />
              <span style={s.authText}>
                <strong>I authorize payroll deduction</strong>
                <br />
                By checking this box, you agree to the terms of the EduKard
                Payroll Deduction Agreement and authorize your employer to deduct
                payments from your wages.
              </span>
            </label>
            <button
              style={{ ...s.authBtn, opacity: authorized ? 1 : 0.5 }}
              disabled={!authorized}
            >
              Continue to Employment Verification
            </button>
          </div>
        </>
      ) : (
        /* EMPLOYER SEARCH VIEW */
        <>
          <div style={s.searchCard}>
            <h2 style={s.searchTitle}>Find Your Employer</h2>
            <p style={s.searchDesc}>
              Search for your employer to connect your payroll account. We use
              read-only access to verify your income.
            </p>
            <input
              type="text"
              placeholder="Search employers (e.g. Tim Hortons, Shoppers, Amazon...)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
            />

            <div style={s.employerGrid}>
              {filtered.map((emp) => (
                <button
                  key={emp.id}
                  style={{
                    ...s.empSearchCard,
                    ...(emp.connected
                      ? {
                          borderColor: "rgba(16,185,129,0.3)",
                          background: "rgba(16,185,129,0.04)",
                        }
                      : {}),
                  }}
                >
                  <div style={s.empSearchIcon}>{emp.logo}</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.empSearchName}>{emp.name}</div>
                    <div style={s.empSearchCategory}>{emp.category}</div>
                  </div>
                  {emp.connected ? (
                    <span style={s.empConnected}>● Connected</span>
                  ) : (
                    <span style={s.empConnect}>Connect →</span>
                  )}
                </button>
              ))}
            </div>

            {search && filtered.length === 0 && (
              <div style={s.noResults}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
                <div style={{ fontWeight: 600, color: "#F9FAFB" }}>
                  No employers found
                </div>
                <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "4px" }}>
                  Try a different search term or contact support for manual
                  verification.
                </div>
              </div>
            )}
          </div>

          <div style={s.noticeBox}>
            <strong style={{ color: "#F59E0B" }}>
              🔒 Your data is secure
            </strong>
            <p style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.7, marginTop: "6px" }}>
              EduKard connects to your employer&apos;s payroll system using
              bank-level encryption. We only access read-only data (pay stubs,
              employment dates) and never store your employer login credentials.
              You can disconnect at any time from this page.
            </p>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "20px" },
  trustRow: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  trustBadge: { padding: "6px 14px", borderRadius: "100px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#10B981", fontSize: "12px", fontWeight: 600 },
  tabRow: { display: "flex", gap: "8px", marginBottom: "24px" },
  tab: { padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  tabActive: { border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10B981" },

  /* Connected employer */
  employerCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "20px" },
  employerHeader: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", flexWrap: "wrap" as const },
  employerIconWrap: { width: "48px", height: "48px", borderRadius: "12px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 },
  employerName: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB" },
  employerMeta: { fontSize: "13px", color: "#6B7280", marginTop: "3px" },
  connectedBadge: { marginLeft: "auto", padding: "6px 14px", borderRadius: "100px", background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: "12px", fontWeight: 700 },
  employerDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" },
  detLabel: { display: "block", fontSize: "12px", color: "#6B7280", marginBottom: "2px" },
  detValue: { display: "block", fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },

  /* Consent */
  consentCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "20px", marginBottom: "24px" },
  consentLabel: { display: "flex", gap: "12px", alignItems: "flex-start", cursor: "pointer" },
  consentText: { fontSize: "14px", color: "#D1D5DB", lineHeight: 1.7 },
  checkbox: { marginTop: "4px", accentColor: "#10B981", width: "20px", height: "20px", flexShrink: 0 },

  /* Payslips */
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "550px" },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },

  /* Steps */
  stepsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  stepCard: { background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "12px", padding: "22px 20px", textAlign: "center" as const },
  stepIcon: { fontSize: "32px", marginBottom: "10px" },
  stepTitle: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB", marginBottom: "6px" },
  stepDesc: { fontSize: "13px", color: "#6B7280", lineHeight: 1.6 },

  /* Auth */
  authCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  authLabel: { display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "20px", cursor: "pointer" },
  authText: { fontSize: "14px", color: "#D1D5DB", lineHeight: 1.7 },
  authBtn: { width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "15px", fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(16,185,129,0.15)" },

  /* Employer Search */
  searchCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "32px", marginBottom: "20px" },
  searchTitle: { fontSize: "20px", fontWeight: 700, color: "#F9FAFB", marginBottom: "8px" },
  searchDesc: { fontSize: "14px", color: "#6B7280", marginBottom: "20px", lineHeight: 1.6 },
  searchInput: { width: "100%", padding: "14px 18px", borderRadius: "12px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", color: "#F9FAFB", fontSize: "15px", outline: "none", marginBottom: "20px" },
  employerGrid: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  empSearchCard: { display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.2)", cursor: "pointer", textAlign: "left" as const, width: "100%", transition: "all 0.2s ease" },
  empSearchIcon: { width: "44px", height: "44px", borderRadius: "10px", background: "rgba(31,41,55,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 },
  empSearchName: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB" },
  empSearchCategory: { fontSize: "12px", color: "#6B7280", marginTop: "2px" },
  empConnected: { fontSize: "12px", fontWeight: 700, color: "#10B981", padding: "4px 12px", borderRadius: "6px", background: "rgba(16,185,129,0.12)" },
  empConnect: { fontSize: "13px", fontWeight: 600, color: "#10B981", padding: "6px 16px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.06)" },
  noResults: { textAlign: "center" as const, padding: "32px 0" },
  noticeBox: { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "14px", padding: "20px" },
};
