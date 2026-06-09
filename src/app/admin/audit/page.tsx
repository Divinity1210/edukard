import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getAdminAuditLogs } from "@/lib/data-access";

export const dynamic = "force-dynamic";

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type AuditRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  created_at: string;
  actor: { full_name: string | null; role: string | null } | null;
};

export default async function AuditLogPage() {
  const profile = await getProfile();
  const logs = (await getAdminAuditLogs(200)) as AuditRow[];

  return (
    <DashboardLayout role="admin" userName={profile?.full_name || "Admin User"}>
      <h1 style={s.title}>Audit Log</h1>
      <p style={s.subtitle}>Immutable record of all actions for compliance and forensic analysis.</p>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead><tr>{["Timestamp", "Actor", "Action", "Entity", "IP"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td style={{ ...s.td, textAlign: "center", color: "#6B7280" }} colSpan={5}>No audit events recorded yet.</td></tr>
            )}
            {logs.map((entry) => (
              <tr key={entry.id}>
                <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12px", color: "#6B7280" }}>{formatTime(entry.created_at)}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{entry.actor?.full_name || (entry.actor?.role ? entry.actor.role : "System")}</td>
                <td style={s.td}>{entry.action}</td>
                <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12px" }}>{entry.entity_type}{entry.entity_id ? `:${entry.entity_id.slice(0, 8)}` : ""}</td>
                <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12px", color: "#6B7280" }}>{entry.ip_address || "—"}</td>
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
