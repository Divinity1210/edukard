"use client";

import { useState, useTransition } from "react";
import { formatCAD } from "@/lib/calculations";
import { addUniversity, addAgent, setUniversityStatus } from "@/lib/actions/admin";

type PartnerStatus = "active" | "inactive" | "pending";

interface UniversityRow {
  id: string;
  name: string;
  dli_number: string;
  province: string;
  city: string;
  contact_email: string | null;
  status: string;
  created_at: string;
  students_funded: number;
  total_disbursed: number;
}

interface AgentRow {
  id: string;
  company_name: string;
  territory: string;
  commission_rate: number;
  referral_code: string;
  created_at: string;
  profile: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
  total_referrals: number;
  total_earned: number;
}

function agentContact(a: AgentRow): { name: string; email: string } {
  const p = Array.isArray(a.profile) ? a.profile[0] : a.profile;
  return { name: p?.full_name || "—", email: p?.email || "—" };
}

export default function PartnersClient({
  universities,
  agents,
}: {
  universities: UniversityRow[];
  agents: AgentRow[];
}) {
  const [tab, setTab] = useState<"universities" | "agents">("universities");
  const [showAddUni, setShowAddUni] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "deactivate" | "activate" } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string; code: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [uniForm, setUniForm] = useState({ name: "", dli: "", province: "", city: "", contactEmail: "" });
  const [agentForm, setAgentForm] = useState({ company: "", contact: "", email: "", territory: "", commissionRate: "10" });

  const handleAddUni = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", uniForm.name);
      fd.set("dliNumber", uniForm.dli);
      fd.set("province", uniForm.province || "—");
      fd.set("city", uniForm.city || "—");
      fd.set("contactEmail", uniForm.contactEmail);
      const res = await addUniversity(fd);
      if (res?.error) return setError(res.error);
      setUniForm({ name: "", dli: "", province: "", city: "", contactEmail: "" });
      setShowAddUni(false);
    });
  };

  const handleAddAgent = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("companyName", agentForm.company);
      fd.set("contactName", agentForm.contact);
      fd.set("email", agentForm.email);
      fd.set("territory", agentForm.territory || "—");
      fd.set("commissionRate", agentForm.commissionRate);
      const res = await addAgent(fd);
      if (res?.error) return setError(res.error);
      setAgentForm({ company: "", contact: "", email: "", territory: "", commissionRate: "10" });
      setShowAddAgent(false);
      if (res?.tempPassword) {
        setCredentials({ email: res.email!, password: res.tempPassword, code: res.referralCode! });
      }
    });
  };

  const handleStatusChange = () => {
    if (!confirmAction) return;
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("universityId", confirmAction.id);
      fd.set("status", confirmAction.action === "deactivate" ? "inactive" : "active");
      const res = await setUniversityStatus(fd);
      if (res?.error) setError(res.error);
      setConfirmAction(null);
    });
  };

  const statusColor = (s: PartnerStatus) => (s === "active" ? "#10B981" : s === "pending" ? "#F59E0B" : "#6B7280");
  const statusBg = (s: PartnerStatus) =>
    s === "active" ? "rgba(16,185,129,0.12)" : s === "pending" ? "rgba(245,158,11,0.12)" : "rgba(107,114,128,0.12)";

  return (
    <>
      <div style={st.headerRow}>
        <div>
          <h1 style={st.title}>Partner Management</h1>
          <p style={st.subtitle}>Onboard and manage university partners and referral agents.</p>
        </div>
        <button style={st.addBtn} onClick={() => (tab === "universities" ? setShowAddUni(true) : setShowAddAgent(true))}>
          + Add {tab === "universities" ? "University" : "Agent"}
        </button>
      </div>

      {error && <div style={st.errorBanner}>⚠️ {error}</div>}

      {/* Tabs */}
      <div style={st.tabs}>
        <button onClick={() => setTab("universities")} style={{ ...st.tab, ...(tab === "universities" ? st.tabActive : {}) }}>
          🏛️ Universities ({universities.length})
        </button>
        <button onClick={() => setTab("agents")} style={{ ...st.tab, ...(tab === "agents" ? st.tabActive : {}) }}>
          🤝 Referral Agents ({agents.length})
        </button>
      </div>

      {/* University Add Form */}
      {showAddUni && (
        <div style={st.formCard}>
          <div style={st.formHeader}>
            <h2 style={st.formTitle}>Add University Partner</h2>
            <button style={st.closeBtn} onClick={() => setShowAddUni(false)}>✕</button>
          </div>
          <div style={st.formGrid}>
            <div style={st.field}><label style={st.label}>Institution Name *</label><input style={st.input} placeholder="University of Alberta" value={uniForm.name} onChange={(e) => setUniForm({ ...uniForm, name: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>DLI Number *</label><input style={st.input} placeholder="O19395067032" value={uniForm.dli} onChange={(e) => setUniForm({ ...uniForm, dli: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Province</label><input style={st.input} placeholder="Ontario" value={uniForm.province} onChange={(e) => setUniForm({ ...uniForm, province: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>City</label><input style={st.input} placeholder="Toronto" value={uniForm.city} onChange={(e) => setUniForm({ ...uniForm, city: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Registrar Contact Email *</label><input style={st.input} type="email" placeholder="bursar@university.ca" value={uniForm.contactEmail} onChange={(e) => setUniForm({ ...uniForm, contactEmail: e.target.value })} /></div>
          </div>
          <div style={st.formActions}>
            <button style={st.cancelBtn} onClick={() => setShowAddUni(false)}>Cancel</button>
            <button
              style={{ ...st.submitBtn, opacity: uniForm.name && uniForm.dli && uniForm.contactEmail && !isPending ? 1 : 0.5 }}
              onClick={handleAddUni}
              disabled={!uniForm.name || !uniForm.dli || !uniForm.contactEmail || isPending}
            >
              {isPending ? "Adding…" : "Add University Partner"}
            </button>
          </div>
        </div>
      )}

      {/* Agent Add Form */}
      {showAddAgent && (
        <div style={st.formCard}>
          <div style={st.formHeader}>
            <h2 style={st.formTitle}>Add Referral Agent</h2>
            <button style={st.closeBtn} onClick={() => setShowAddAgent(false)}>✕</button>
          </div>
          <div style={st.formGrid}>
            <div style={st.field}><label style={st.label}>Company Name *</label><input style={st.input} placeholder="Global Ed Partners" value={agentForm.company} onChange={(e) => setAgentForm({ ...agentForm, company: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Contact Person *</label><input style={st.input} placeholder="John Doe" value={agentForm.contact} onChange={(e) => setAgentForm({ ...agentForm, contact: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Email *</label><input style={st.input} type="email" placeholder="john@company.com" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Territory</label><input style={st.input} placeholder="West Africa" value={agentForm.territory} onChange={(e) => setAgentForm({ ...agentForm, territory: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Commission Rate (%)</label><input style={st.input} type="number" min="1" max="25" value={agentForm.commissionRate} onFocus={(e) => e.target.select()} onChange={(e) => setAgentForm({ ...agentForm, commissionRate: e.target.value })} /></div>
          </div>
          <div style={st.formActions}>
            <button style={st.cancelBtn} onClick={() => setShowAddAgent(false)}>Cancel</button>
            <button
              style={{ ...st.submitBtn, opacity: agentForm.company && agentForm.contact && agentForm.email && !isPending ? 1 : 0.5 }}
              onClick={handleAddAgent}
              disabled={!agentForm.company || !agentForm.contact || !agentForm.email || isPending}
            >
              {isPending ? "Creating account…" : "Add Referral Agent"}
            </button>
          </div>
        </div>
      )}

      {/* University Table */}
      {tab === "universities" && (
        <div style={st.tableCard}>
          <table style={st.table}>
            <thead>
              <tr>{["Institution", "DLI #", "Location", "Students", "Disbursed", "Status", "Actions"].map((h) => <th key={h} style={st.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {universities.map((u) => (
                <tr key={u.id}>
                  <td style={st.td}>
                    <div style={{ fontWeight: 600, color: "#F9FAFB" }}>{u.name}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{u.contact_email || "—"}</div>
                  </td>
                  <td style={{ ...st.td, fontFamily: "monospace", fontSize: "13px" }}>{u.dli_number}</td>
                  <td style={st.td}>{u.city}, {u.province}</td>
                  <td style={{ ...st.td, fontWeight: 600 }}>{u.students_funded}</td>
                  <td style={{ ...st.td, fontWeight: 600, color: "#10B981" }}>{formatCAD(u.total_disbursed)}</td>
                  <td style={st.td}>
                    <span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: statusBg(u.status as PartnerStatus), color: statusColor(u.status as PartnerStatus) }}>
                      ● {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={st.td}>
                    <div style={st.actionBtns}>
                      {u.status === "active" ? (
                        <button style={st.deactBtn} onClick={() => setConfirmAction({ id: u.id, action: "deactivate" })}>Deactivate</button>
                      ) : (
                        <button style={st.actBtn} onClick={() => setConfirmAction({ id: u.id, action: "activate" })}>
                          {u.status === "pending" ? "Approve" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Agent Table */}
      {tab === "agents" && (
        <div style={st.tableCard}>
          {agents.length === 0 ? (
            <div style={st.empty}>No referral agents yet. Add your first partner above.</div>
          ) : (
            <table style={st.table}>
              <thead>
                <tr>{["Company", "Contact", "Territory", "Referral Code", "Rate", "Referrals", "Earned", "Joined"].map((h) => <th key={h} style={st.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {agents.map((a) => {
                  const contact = agentContact(a);
                  return (
                    <tr key={a.id}>
                      <td style={{ ...st.td, fontWeight: 600, color: "#F9FAFB" }}>{a.company_name}</td>
                      <td style={st.td}>
                        <div>{contact.name}</div>
                        <div style={{ fontSize: "12px", color: "#6B7280" }}>{contact.email}</div>
                      </td>
                      <td style={st.td}>{a.territory}</td>
                      <td style={st.td}><span style={st.codeBadge}>{a.referral_code}</span></td>
                      <td style={{ ...st.td, fontWeight: 700, color: "#EC4899" }}>{Math.round(Number(a.commission_rate) * 100)}%</td>
                      <td style={{ ...st.td, fontWeight: 600 }}>{a.total_referrals}</td>
                      <td style={{ ...st.td, fontWeight: 600, color: "#10B981" }}>{formatCAD(a.total_earned)}</td>
                      <td style={st.td}>{new Date(a.created_at).toLocaleDateString("en-CA")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* University status confirmation */}
      {confirmAction && (
        <div style={st.overlay} onClick={() => setConfirmAction(null)}>
          <div style={st.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "36px", textAlign: "center" as const, marginBottom: "16px" }}>
              {confirmAction.action === "deactivate" ? "⚠️" : "✅"}
            </div>
            <h3 style={st.modalTitle}>{confirmAction.action === "deactivate" ? "Deactivate Partner?" : "Activate Partner?"}</h3>
            <p style={st.modalDesc}>
              {confirmAction.action === "deactivate"
                ? "This partner will be marked as inactive. They will not appear in student-facing searches and settlements will be paused."
                : "This partner will be active and visible in the platform."}
            </p>
            <div style={st.modalActions}>
              <button style={st.cancelBtn} onClick={() => setConfirmAction(null)}>Cancel</button>
              <button
                style={{ ...st.submitBtn, background: confirmAction.action === "activate" ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #F59E0B, #D97706)" }}
                onClick={handleStatusChange}
                disabled={isPending}
              >
                {isPending ? "…" : confirmAction.action === "deactivate" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One-time agent credentials handoff */}
      {credentials && (
        <div style={st.overlay}>
          <div style={st.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "36px", textAlign: "center" as const, marginBottom: "16px" }}>🔑</div>
            <h3 style={st.modalTitle}>Agent Account Created</h3>
            <p style={st.modalDesc}>
              Share these credentials with the partner securely. The password is shown <strong>once</strong> — it cannot be
              retrieved later (they can reset it via the login page).
            </p>
            <div style={st.credBox}>
              <div style={st.credRow}><span style={st.credLabel}>Email</span><span style={st.credValue}>{credentials.email}</span></div>
              <div style={st.credRow}><span style={st.credLabel}>Temp password</span><span style={st.credValue}>{credentials.password}</span></div>
              <div style={st.credRow}><span style={st.credLabel}>Referral code</span><span style={{ ...st.credValue, color: "#EC4899" }}>{credentials.code}</span></div>
            </div>
            <div style={st.modalActions}>
              <button style={st.submitBtn} onClick={() => setCredentials(null)}>Done — credentials shared</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const st: Record<string, React.CSSProperties> = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  addBtn: { padding: "12px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(139,92,246,0.2)", whiteSpace: "nowrap" as const },
  errorBanner: { padding: "12px 18px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#F87171", fontSize: "14px", marginBottom: "16px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "24px" },
  tab: { padding: "10px 20px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  tabActive: { border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.1)", color: "#8B5CF6" },

  formCard: { background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "14px", padding: "28px", marginBottom: "24px" },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  formTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB" },
  closeBtn: { width: "32px", height: "32px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" },
  field: { display: "flex", flexDirection: "column" as const, gap: "6px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#D1D5DB" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.3)", background: "rgba(31,41,55,0.4)", color: "#F9FAFB", fontSize: "14px", outline: "none" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  cancelBtn: { padding: "10px 24px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  submitBtn: { padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer" },

  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "900px" },
  th: { padding: "14px 16px", fontSize: "11px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, letterSpacing: "0.5px", borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  codeBadge: { padding: "4px 10px", borderRadius: "6px", background: "rgba(236,72,153,0.1)", color: "#EC4899", fontSize: "12px", fontWeight: 700, fontFamily: "monospace" },
  actionBtns: { display: "flex", gap: "6px" },
  deactBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.08)", color: "#F59E0B", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  actBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  empty: { padding: "48px", textAlign: "center" as const, color: "#6B7280", fontSize: "14px" },

  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", padding: "32px", maxWidth: "480px", width: "90%" },
  modalTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", textAlign: "center" as const, marginBottom: "8px" },
  modalDesc: { fontSize: "14px", color: "#6B7280", textAlign: "center" as const, lineHeight: 1.7, marginBottom: "24px" },
  modalActions: { display: "flex", gap: "10px", justifyContent: "center" },
  credBox: { display: "flex", flexDirection: "column" as const, gap: "10px", padding: "16px", borderRadius: "10px", background: "rgba(31,41,55,0.5)", border: "1px solid rgba(75,85,99,0.25)", marginBottom: "24px" },
  credRow: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" },
  credLabel: { fontSize: "12px", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  credValue: { fontSize: "14px", color: "#F9FAFB", fontFamily: "monospace", fontWeight: 700, userSelect: "all" as const },
};
