"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_UNIVERSITY_INVOICES } from "@/lib/mock-data";
import { formatCAD } from "@/lib/calculations";
import { useState } from "react";

export default function UniversityInvoicesPage() {
  const invoices = MOCK_UNIVERSITY_INVOICES;
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);

  return (
    <DashboardLayout role="university" userName="UofT Bursar">
      <div style={s.header}>
        <div><h1 style={s.title}>Invoice Management</h1><p style={s.subtitle}>Upload and verify student tuition invoices.</p></div>
        <button style={s.uploadBtn}>+ Upload Invoices</button>
      </div>

      <div style={s.tabs}>
        {["all", "unmatched", "matched", "settled"].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)} style={{ ...s.tab, ...(filter === tab ? s.activeTab : {}) }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Student Name & ID</th>
              <th style={s.th}>Program & Term</th>
              <th style={s.th}>Tuition Amount</th>
              <th style={s.th}>EduKard Match</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td style={s.td}><div>{inv.student_name}</div><div style={s.subText}>{inv.student_id}</div></td>
                <td style={s.td}><div>{inv.program_name}</div><div style={s.subText}>{inv.term}</div></td>
                <td style={{ ...s.td, fontWeight: 700, color: "#F9FAFB" }}>{formatCAD(inv.tuition_amount)}</td>
                <td style={s.td}>{inv.edukard_loan_id ? <span style={s.matchedText}>✓ {inv.edukard_loan_id}</span> : <span style={s.unmatchedText}>None</span>}</td>
                <td style={s.td}>
                  <span style={{
                    ...s.badge,
                    background: inv.status === "settled" ? "rgba(16,185,129,0.12)" : inv.status === "matched" ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.12)",
                    color: inv.status === "settled" ? "#10B981" : inv.status === "matched" ? "#3B82F6" : "#F59E0B"
                  }}>
                    {inv.status.toUpperCase()}
                  </span>
                </td>
                <td style={s.td}><button style={s.actionBtn}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  uploadBtn: { padding: "10px 20px", borderRadius: "10px", background: "#F59E0B", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" },
  tabs: { display: "flex", gap: "10px", marginBottom: "20px" },
  tab: { padding: "8px 16px", borderRadius: "8px", background: "transparent", color: "#6B7280", border: "1px solid rgba(75,85,99,0.3)", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  activeTab: { background: "rgba(245,158,11,0.15)", color: "#F59E0B", borderColor: "rgba(245,158,11,0.3)" },
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "14px 20px", textAlign: "left" as const, fontSize: "12px", fontWeight: 600, color: "#6B7280", borderBottom: "1px solid rgba(75,85,99,0.2)", textTransform: "uppercase" as const },
  td: { padding: "16px 20px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  subText: { fontSize: "12px", color: "#6B7280", marginTop: "2px" },
  matchedText: { fontSize: "13px", color: "#10B981", fontWeight: 600, background: "rgba(16,185,129,0.1)", padding: "4px 8px", borderRadius: "6px" },
  unmatchedText: { fontSize: "13px", color: "#6B7280" },
  badge: { padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" },
  actionBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#D1D5DB", fontSize: "12px", cursor: "pointer" },
};
