"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatCAD } from "@/lib/calculations";

type PartnerStatus = "active" | "inactive" | "pending";

interface UniversityPartner {
  id: string; name: string; dli: string; province: string; city: string;
  contactEmail: string; status: PartnerStatus; studentsFunded: number;
  totalDisbursed: number; joinedAt: string;
}

interface AgentPartner {
  id: string; company: string; contact: string; email: string;
  territory: string; referralCode: string; commissionRate: number;
  totalReferrals: number; totalEarned: number; status: PartnerStatus; joinedAt: string;
}

const INITIAL_UNIVERSITIES: UniversityPartner[] = [
  { id: "up-1", name: "University of Toronto", dli: "O19395067032", province: "Ontario", city: "Toronto", contactEmail: "bursar@utoronto.ca", status: "active", studentsFunded: 142, totalDisbursed: 2150000, joinedAt: "2025-09-01" },
  { id: "up-2", name: "University of British Columbia", dli: "O19394953782", province: "British Columbia", city: "Vancouver", contactEmail: "finance@ubc.ca", status: "active", studentsFunded: 87, totalDisbursed: 1340000, joinedAt: "2025-10-15" },
  { id: "up-3", name: "McGill University", dli: "O19359018462", province: "Quebec", city: "Montreal", contactEmail: "registrar@mcgill.ca", status: "active", studentsFunded: 63, totalDisbursed: 1120000, joinedAt: "2025-11-01" },
  { id: "up-4", name: "Conestoga College", dli: "O19361274252", province: "Ontario", city: "Kitchener", contactEmail: "finance@conestogac.on.ca", status: "pending", studentsFunded: 0, totalDisbursed: 0, joinedAt: "2026-03-20" },
];

const INITIAL_AGENTS: AgentPartner[] = [
  { id: "ap-1", company: "Global Ed Partners", contact: "David Mensah", email: "david@globaledpartners.com", territory: "West Africa", referralCode: "GEP-2026-DM", commissionRate: 10, totalReferrals: 114, totalEarned: 47000, status: "active", joinedAt: "2025-08-15" },
  { id: "ap-2", company: "StudyPath Canada", contact: "Anil Kapoor", email: "anil@studypath.ca", territory: "South Asia", referralCode: "SPC-2026-AK", commissionRate: 10, totalReferrals: 76, totalEarned: 31200, status: "active", joinedAt: "2025-09-20" },
  { id: "ap-3", company: "EduBridge International", contact: "Maria Santos", email: "maria@edubridge.io", territory: "Latin America", referralCode: "EBI-2026-MS", commissionRate: 8, totalReferrals: 23, totalEarned: 8400, status: "inactive", joinedAt: "2025-11-10" },
];

export default function AdminPartnersPage() {
  const [tab, setTab] = useState<"universities" | "agents">("universities");
  const [universities, setUniversities] = useState(INITIAL_UNIVERSITIES);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [showAddUni, setShowAddUni] = useState(false);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: "uni" | "agent"; action: "deactivate" | "activate" | "remove" } | null>(null);

  // University form state
  const [uniForm, setUniForm] = useState({ name: "", dli: "", province: "", city: "", contactEmail: "", bankTransit: "", bankInst: "", bankAcct: "" });
  // Agent form state
  const [agentForm, setAgentForm] = useState({ company: "", contact: "", email: "", territory: "", commissionRate: "10" });

  const handleAddUni = () => {
    if (!uniForm.name || !uniForm.dli || !uniForm.contactEmail) return;
    const newUni: UniversityPartner = {
      id: `up-${Date.now()}`, name: uniForm.name, dli: uniForm.dli, province: uniForm.province, city: uniForm.city,
      contactEmail: uniForm.contactEmail, status: "pending", studentsFunded: 0, totalDisbursed: 0, joinedAt: new Date().toISOString().split("T")[0],
    };
    setUniversities([newUni, ...universities]);
    setUniForm({ name: "", dli: "", province: "", city: "", contactEmail: "", bankTransit: "", bankInst: "", bankAcct: "" });
    setShowAddUni(false);
  };

  const handleAddAgent = () => {
    if (!agentForm.company || !agentForm.contact || !agentForm.email) return;
    const code = `${agentForm.company.split(" ").map(w => w[0]).join("").toUpperCase()}-2026-${agentForm.contact.split(" ").map(w => w[0]).join("").toUpperCase()}`;
    const newAgent: AgentPartner = {
      id: `ap-${Date.now()}`, company: agentForm.company, contact: agentForm.contact, email: agentForm.email,
      territory: agentForm.territory, referralCode: code, commissionRate: Number(agentForm.commissionRate),
      totalReferrals: 0, totalEarned: 0, status: "pending", joinedAt: new Date().toISOString().split("T")[0],
    };
    setAgents([newAgent, ...agents]);
    setAgentForm({ company: "", contact: "", email: "", territory: "", commissionRate: "10" });
    setShowAddAgent(false);
  };

  const handlePartnerAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "uni") {
      if (confirmAction.action === "remove") {
        setUniversities(universities.filter(u => u.id !== confirmAction.id));
      } else {
        setUniversities(universities.map(u => u.id === confirmAction.id ? { ...u, status: confirmAction.action === "deactivate" ? "inactive" as const : "active" as const } : u));
      }
    } else {
      if (confirmAction.action === "remove") {
        setAgents(agents.filter(a => a.id !== confirmAction.id));
      } else {
        setAgents(agents.map(a => a.id === confirmAction.id ? { ...a, status: confirmAction.action === "deactivate" ? "inactive" as const : "active" as const } : a));
      }
    }
    setConfirmAction(null);
  };

  const statusColor = (s: PartnerStatus) => s === "active" ? "#10B981" : s === "pending" ? "#F59E0B" : "#6B7280";
  const statusBg = (s: PartnerStatus) => s === "active" ? "rgba(16,185,129,0.12)" : s === "pending" ? "rgba(245,158,11,0.12)" : "rgba(107,114,128,0.12)";

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div style={st.headerRow}>
        <div>
          <h1 style={st.title}>Partner Management</h1>
          <p style={st.subtitle}>Onboard and manage university partners and referral agents.</p>
        </div>
        <button style={st.addBtn} onClick={() => tab === "universities" ? setShowAddUni(true) : setShowAddAgent(true)}>
          + Add {tab === "universities" ? "University" : "Agent"}
        </button>
      </div>

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
            <div style={st.field}><label style={st.label}>Institution Name *</label><input style={st.input} placeholder="University of Alberta" value={uniForm.name} onChange={e => setUniForm({ ...uniForm, name: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>DLI Number *</label><input style={st.input} placeholder="O19395067032" value={uniForm.dli} onChange={e => setUniForm({ ...uniForm, dli: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Province</label><input style={st.input} placeholder="Ontario" value={uniForm.province} onChange={e => setUniForm({ ...uniForm, province: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>City</label><input style={st.input} placeholder="Toronto" value={uniForm.city} onChange={e => setUniForm({ ...uniForm, city: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Registrar Contact Email *</label><input style={st.input} type="email" placeholder="bursar@university.ca" value={uniForm.contactEmail} onChange={e => setUniForm({ ...uniForm, contactEmail: e.target.value })} /></div>
          </div>
          <h3 style={{ ...st.formTitle, fontSize: "15px", marginTop: "20px" }}>Settlement Bank Details</h3>
          <div style={st.formGrid}>
            <div style={st.field}><label style={st.label}>Transit #</label><input style={st.input} placeholder="04512" value={uniForm.bankTransit} onChange={e => setUniForm({ ...uniForm, bankTransit: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Institution #</label><input style={st.input} placeholder="003" value={uniForm.bankInst} onChange={e => setUniForm({ ...uniForm, bankInst: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Account #</label><input style={st.input} placeholder="1234567" value={uniForm.bankAcct} onChange={e => setUniForm({ ...uniForm, bankAcct: e.target.value })} /></div>
          </div>
          <div style={st.formActions}>
            <button style={st.cancelBtn} onClick={() => setShowAddUni(false)}>Cancel</button>
            <button style={{ ...st.submitBtn, opacity: uniForm.name && uniForm.dli && uniForm.contactEmail ? 1 : 0.5 }} onClick={handleAddUni} disabled={!uniForm.name || !uniForm.dli || !uniForm.contactEmail}>Add University Partner</button>
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
            <div style={st.field}><label style={st.label}>Company Name *</label><input style={st.input} placeholder="Global Ed Partners" value={agentForm.company} onChange={e => setAgentForm({ ...agentForm, company: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Contact Person *</label><input style={st.input} placeholder="John Doe" value={agentForm.contact} onChange={e => setAgentForm({ ...agentForm, contact: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Email *</label><input style={st.input} type="email" placeholder="john@company.com" value={agentForm.email} onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Territory</label><input style={st.input} placeholder="West Africa" value={agentForm.territory} onChange={e => setAgentForm({ ...agentForm, territory: e.target.value })} /></div>
            <div style={st.field}><label style={st.label}>Commission Rate (%)</label><input style={st.input} type="number" min="1" max="20" value={agentForm.commissionRate} onFocus={e => e.target.select()} onChange={e => setAgentForm({ ...agentForm, commissionRate: e.target.value })} /></div>
          </div>
          {agentForm.company && agentForm.contact && (
            <div style={st.codePreview}>
              <span style={st.codeLabel}>Auto-generated Referral Code:</span>
              <span style={st.codeValue}>{`${agentForm.company.split(" ").map(w => w[0]).join("").toUpperCase()}-2026-${agentForm.contact.split(" ").map(w => w[0]).join("").toUpperCase()}`}</span>
            </div>
          )}
          <div style={st.formActions}>
            <button style={st.cancelBtn} onClick={() => setShowAddAgent(false)}>Cancel</button>
            <button style={{ ...st.submitBtn, opacity: agentForm.company && agentForm.contact && agentForm.email ? 1 : 0.5 }} onClick={handleAddAgent} disabled={!agentForm.company || !agentForm.contact || !agentForm.email}>Add Referral Agent</button>
          </div>
        </div>
      )}

      {/* University Table */}
      {tab === "universities" && (
        <div style={st.tableCard}>
          <table style={st.table}>
            <thead><tr>
              {["Institution", "DLI #", "Location", "Students", "Disbursed", "Status", "Actions"].map(h => <th key={h} style={st.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {universities.map(u => (
                <tr key={u.id}>
                  <td style={st.td}>
                    <div style={{ fontWeight: 600, color: "#F9FAFB" }}>{u.name}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>{u.contactEmail}</div>
                  </td>
                  <td style={{ ...st.td, fontFamily: "monospace", fontSize: "13px" }}>{u.dli}</td>
                  <td style={st.td}>{u.city}, {u.province}</td>
                  <td style={{ ...st.td, fontWeight: 600 }}>{u.studentsFunded}</td>
                  <td style={{ ...st.td, fontWeight: 600, color: "#10B981" }}>{formatCAD(u.totalDisbursed)}</td>
                  <td style={st.td}><span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: statusBg(u.status), color: statusColor(u.status) }}>● {u.status.toUpperCase()}</span></td>
                  <td style={st.td}>
                    <div style={st.actionBtns}>
                      {u.status === "active" ? (
                        <button style={st.deactBtn} onClick={() => setConfirmAction({ id: u.id, type: "uni", action: "deactivate" })}>Deactivate</button>
                      ) : u.status === "inactive" ? (
                        <button style={st.actBtn} onClick={() => setConfirmAction({ id: u.id, type: "uni", action: "activate" })}>Activate</button>
                      ) : (
                        <button style={st.actBtn} onClick={() => setConfirmAction({ id: u.id, type: "uni", action: "activate" })}>Approve</button>
                      )}
                      <button style={st.removeBtn} onClick={() => setConfirmAction({ id: u.id, type: "uni", action: "remove" })}>Remove</button>
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
          <table style={st.table}>
            <thead><tr>
              {["Company", "Contact", "Territory", "Referral Code", "Rate", "Referrals", "Earned", "Status", "Actions"].map(h => <th key={h} style={st.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.id}>
                  <td style={{ ...st.td, fontWeight: 600, color: "#F9FAFB" }}>{a.company}</td>
                  <td style={st.td}>
                    <div>{a.contact}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280" }}>{a.email}</div>
                  </td>
                  <td style={st.td}>{a.territory}</td>
                  <td style={st.td}><span style={st.codeBadge}>{a.referralCode}</span></td>
                  <td style={{ ...st.td, fontWeight: 700, color: "#EC4899" }}>{a.commissionRate}%</td>
                  <td style={{ ...st.td, fontWeight: 600 }}>{a.totalReferrals}</td>
                  <td style={{ ...st.td, fontWeight: 600, color: "#10B981" }}>{formatCAD(a.totalEarned)}</td>
                  <td style={st.td}><span style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: statusBg(a.status), color: statusColor(a.status) }}>● {a.status.toUpperCase()}</span></td>
                  <td style={st.td}>
                    <div style={st.actionBtns}>
                      {a.status === "active" ? (
                        <button style={st.deactBtn} onClick={() => setConfirmAction({ id: a.id, type: "agent", action: "deactivate" })}>Deactivate</button>
                      ) : (
                        <button style={st.actBtn} onClick={() => setConfirmAction({ id: a.id, type: "agent", action: "activate" })}>Activate</button>
                      )}
                      <button style={st.removeBtn} onClick={() => setConfirmAction({ id: a.id, type: "agent", action: "remove" })}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div style={st.overlay} onClick={() => setConfirmAction(null)}>
          <div style={st.modal} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "36px", textAlign: "center" as const, marginBottom: "16px" }}>
              {confirmAction.action === "remove" ? "🗑️" : confirmAction.action === "deactivate" ? "⚠️" : "✅"}
            </div>
            <h3 style={st.modalTitle}>
              {confirmAction.action === "remove" ? "Remove Partner?" : confirmAction.action === "deactivate" ? "Deactivate Partner?" : "Activate Partner?"}
            </h3>
            <p style={st.modalDesc}>
              {confirmAction.action === "remove"
                ? "This will permanently remove this partner from the platform. This action cannot be undone."
                : confirmAction.action === "deactivate"
                ? "This partner will be marked as inactive. They will not appear in student-facing searches and settlements will be paused."
                : "This partner will be reactivated and visible in the platform."
              }
            </p>
            <div style={st.modalActions}>
              <button style={st.cancelBtn} onClick={() => setConfirmAction(null)}>Cancel</button>
              <button style={{ ...st.submitBtn, background: confirmAction.action === "remove" ? "linear-gradient(135deg, #EF4444, #DC2626)" : confirmAction.action === "activate" ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #F59E0B, #D97706)" }} onClick={handlePartnerAction}>
                {confirmAction.action === "remove" ? "Remove Permanently" : confirmAction.action === "deactivate" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const st: Record<string, React.CSSProperties> = {
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" },
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginTop: "4px" },
  addBtn: { padding: "12px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(139,92,246,0.2)", whiteSpace: "nowrap" as const },
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
  codePreview: { display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", borderRadius: "10px", background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)", marginTop: "16px" },
  codeLabel: { fontSize: "13px", color: "#6B7280" },
  codeValue: { fontSize: "15px", fontWeight: 700, color: "#EC4899", fontFamily: "monospace" },

  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "900px" },
  th: { padding: "14px 16px", fontSize: "11px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, letterSpacing: "0.5px", borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  codeBadge: { padding: "4px 10px", borderRadius: "6px", background: "rgba(236,72,153,0.1)", color: "#EC4899", fontSize: "12px", fontWeight: 700, fontFamily: "monospace" },
  actionBtns: { display: "flex", gap: "6px" },
  deactBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.08)", color: "#F59E0B", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  actBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(16,185,129,0.2)", background: "rgba(16,185,129,0.08)", color: "#10B981", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  removeBtn: { padding: "6px 12px", borderRadius: "6px", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.08)", color: "#EF4444", fontSize: "12px", fontWeight: 600, cursor: "pointer" },

  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", padding: "32px", maxWidth: "440px", width: "90%" },
  modalTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", textAlign: "center" as const, marginBottom: "8px" },
  modalDesc: { fontSize: "14px", color: "#6B7280", textAlign: "center" as const, lineHeight: 1.7, marginBottom: "24px" },
  modalActions: { display: "flex", gap: "10px", justifyContent: "center" },
};
