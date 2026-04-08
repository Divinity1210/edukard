"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_AUDIT_LOG } from "@/lib/mock-data";

const EXTENDED_LOG = [
  { id: "al-1", user: "Admin", action: "Approved loan application", entity: "loan-001", time: "Feb 20, 2026 2:30 PM", ip: "192.168.1.x" },
  { id: "al-2", user: "System", action: "Disbursed funds to University of Toronto", entity: "loan-001", time: "Mar 1, 2026 9:00 AM", ip: "—" },
  { id: "al-3", user: "System", action: "PAD payment collected", entity: "payment-001", time: "Mar 1, 2026 10:00 AM", ip: "—" },
  { id: "al-4", user: "Amara Okafor", action: "Updated bank account details", entity: "profile-001", time: "Mar 5, 2026 3:15 PM", ip: "24.114.x.x" },
  { id: "al-5", user: "System", action: "PAD payment collected", entity: "payment-002", time: "Apr 1, 2026 10:00 AM", ip: "—" },
  { id: "al-6", user: "Admin", action: "Flagged account for review", entity: "user-s-004", time: "Apr 1, 2026 11:30 AM", ip: "192.168.1.x" },
  { id: "al-7", user: "Marcus Chen", action: "Deposited $25,000 to Junior tranche", entity: "inv-002", time: "Jan 20, 2026 10:00 AM", ip: "68.148.x.x" },
  { id: "al-8", user: "Admin", action: "Paused loan originations", entity: "treasury", time: "Apr 2, 2026 2:00 PM", ip: "192.168.1.x" },
];

export default function AuditLogPage() {
  return (
    <DashboardLayout role="admin" userName="Admin User">
      <h1 style={s.title}>Audit Log</h1>
      <p style={s.subtitle}>Immutable record of all actions for compliance and forensic analysis.</p>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead><tr>{["Timestamp", "User", "Action", "Entity", "IP"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {EXTENDED_LOG.map((entry) => (
              <tr key={entry.id}>
                <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12px", color: "#6B7280" }}>{entry.time}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{entry.user}</td>
                <td style={s.td}>{entry.action}</td>
                <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12px" }}>{entry.entity}</td>
                <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12px", color: "#6B7280" }}>{entry.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={s.notice}>
        🔒 Audit logs are append-only. No entries can be modified or deleted. Retained for 7 years per FINTRAC requirements.
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "24px" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "700px" },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  notice: { padding: "14px 20px", borderRadius: "12px", background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.25)", fontSize: "13px", color: "#6B7280", lineHeight: 1.6 },
};
