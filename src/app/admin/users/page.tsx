"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface User {
  id: string; name: string; email: string; role: "Student" | "Investor"; status: "Active" | "Under Review" | "Flagged" | "Suspended";
  kyc: "Approved" | "Pending" | "Rejected"; joined: string; phone?: string; address?: string;
  loanAmount?: number; creditScore?: number; invested?: number; yield?: number;
}

const USERS: User[] = [
  { id: "u-1", name: "Amara Okafor", email: "amara.okafor@mail.utoronto.ca", role: "Student", status: "Active", kyc: "Approved", joined: "Jan 15, 2026", phone: "+1 (647) 555-0123", address: "456 Bloor St W, Toronto, ON", loanAmount: 15500, creditScore: 72 },
  { id: "u-2", name: "Priya Sharma", email: "priya.s@ubc.ca", role: "Student", status: "Active", kyc: "Approved", joined: "Mar 28, 2026", phone: "+1 (604) 555-0456", address: "123 W Broadway, Vancouver, BC", loanAmount: 12000, creditScore: 68 },
  { id: "u-3", name: "Jean-Pierre Dubois", email: "jp.dubois@mcgill.ca", role: "Student", status: "Under Review", kyc: "Pending", joined: "Mar 29, 2026", phone: "+1 (514) 555-0789", loanAmount: 18500, creditScore: 52 },
  { id: "u-4", name: "Fatima Al-Rashid", email: "fatima.ar@conestoga.ca", role: "Student", status: "Flagged", kyc: "Approved", joined: "Mar 30, 2026", loanAmount: 8000, creditScore: 31 },
  { id: "u-5", name: "Marcus Chen", email: "marcus.chen@nexuscapital.ca", role: "Investor", status: "Active", kyc: "Approved", joined: "Jan 5, 2026", phone: "+1 (416) 555-1234", invested: 75000, yield: 3082 },
  { id: "u-6", name: "Sarah Williams", email: "sarah.w@fundgroup.ca", role: "Investor", status: "Active", kyc: "Approved", joined: "Feb 10, 2026", invested: 150000, yield: 7200 },
];

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<"all" | "Student" | "Investor" | "Flagged">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userList, setUserList] = useState(USERS);
  const [actionConfirm, setActionConfirm] = useState<string | null>(null);

  const filtered = filter === "all" ? userList : filter === "Flagged" ? userList.filter(u => u.status === "Flagged") : userList.filter(u => u.role === filter);

  const handleSuspend = (userId: string) => {
    setUserList(userList.map(u => u.id === userId ? { ...u, status: "Suspended" as const } : u));
    setSelectedUser(prev => prev?.id === userId ? { ...prev, status: "Suspended" as const } : prev);
    setActionConfirm(null);
  };
  const handleActivate = (userId: string) => {
    setUserList(userList.map(u => u.id === userId ? { ...u, status: "Active" as const } : u));
    setSelectedUser(prev => prev?.id === userId ? { ...prev, status: "Active" as const } : prev);
  };
  const handleApproveKyc = (userId: string) => {
    setUserList(userList.map(u => u.id === userId ? { ...u, kyc: "Approved" as const, status: "Active" as const } : u));
    setSelectedUser(prev => prev?.id === userId ? { ...prev, kyc: "Approved" as const, status: "Active" as const } : prev);
  };

  const statusColor = (s: string) => s === "Active" ? "#10B981" : s === "Flagged" ? "#EF4444" : s === "Suspended" ? "#6B7280" : "#F59E0B";
  const statusBg = (s: string) => s === "Active" ? "rgba(16,185,129,0.12)" : s === "Flagged" ? "rgba(239,68,68,0.12)" : s === "Suspended" ? "rgba(107,114,128,0.12)" : "rgba(245,158,11,0.12)";

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <h1 style={s.title}>User Management</h1>
      <p style={s.subtitle}>View and manage all platform users across roles.</p>

      <div style={s.filters}>
        {[
          { k: "all" as const, label: `All (${userList.length})` },
          { k: "Student" as const, label: "Students" },
          { k: "Investor" as const, label: "Investors" },
          { k: "Flagged" as const, label: "Flagged" },
        ].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)} style={{ ...s.filterBtn, ...(filter === f.k ? s.filterActive : {}) }}>{f.label}</button>
        ))}
      </div>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead><tr>{["Name", "Email", "Role", "KYC", "Status", "Joined"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} onClick={() => setSelectedUser(u)} style={{ cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.04)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ ...s.td, fontWeight: 600, color: "#F9FAFB" }}>{u.name}</td>
                <td style={s.td}>{u.email}</td>
                <td style={s.td}><span style={{ ...s.roleBadge, background: u.role === "Student" ? "rgba(16,185,129,0.12)" : "rgba(20,184,166,0.12)", color: u.role === "Student" ? "#10B981" : "#14B8A6" }}>{u.role}</span></td>
                <td style={s.td}><span style={{ ...s.kycBadge, background: u.kyc === "Approved" ? "rgba(16,185,129,0.12)" : u.kyc === "Rejected" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)", color: u.kyc === "Approved" ? "#10B981" : u.kyc === "Rejected" ? "#EF4444" : "#F59E0B" }}>{u.kyc}</span></td>
                <td style={s.td}><span style={{ ...s.statusBadge, background: statusBg(u.status), color: statusColor(u.status) }}>● {u.status}</span></td>
                <td style={s.td}>{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-Out Panel */}
      {selectedUser && (
        <>
          <div style={s.panelOverlay} onClick={() => setSelectedUser(null)} />
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>User Details</h2>
              <button style={s.panelClose} onClick={() => setSelectedUser(null)}>✕</button>
            </div>

            {/* User profile */}
            <div style={s.profileCard}>
              <div style={s.avatar}>{selectedUser.name.charAt(0)}</div>
              <div>
                <div style={s.profileName}>{selectedUser.name}</div>
                <div style={s.profileEmail}>{selectedUser.email}</div>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <span style={{ ...s.roleBadge, background: selectedUser.role === "Student" ? "rgba(16,185,129,0.12)" : "rgba(20,184,166,0.12)", color: selectedUser.role === "Student" ? "#10B981" : "#14B8A6" }}>{selectedUser.role}</span>
                  <span style={{ ...s.statusBadge, background: statusBg(selectedUser.status), color: statusColor(selectedUser.status) }}>● {selectedUser.status}</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={s.detailGrid}>
              <div style={s.detailItem}><span style={s.detailLabel}>Joined</span><span style={s.detailValue}>{selectedUser.joined}</span></div>
              <div style={s.detailItem}><span style={s.detailLabel}>KYC Status</span><span style={{ ...s.detailValue, color: selectedUser.kyc === "Approved" ? "#10B981" : "#F59E0B" }}>{selectedUser.kyc}</span></div>
              {selectedUser.phone && <div style={s.detailItem}><span style={s.detailLabel}>Phone</span><span style={s.detailValue}>{selectedUser.phone}</span></div>}
              {selectedUser.address && <div style={s.detailItem}><span style={s.detailLabel}>Address</span><span style={s.detailValue}>{selectedUser.address}</span></div>}
            </div>

            {/* Role-specific data */}
            {selectedUser.role === "Student" && (
              <div style={s.roleSection}>
                <h3 style={s.roleSectionTitle}>Loan & Credit</h3>
                <div style={s.detailGrid}>
                  {selectedUser.creditScore !== undefined && <div style={s.detailItem}><span style={s.detailLabel}>EduKard Score</span><span style={{ ...s.detailValue, color: selectedUser.creditScore >= 60 ? "#10B981" : selectedUser.creditScore >= 40 ? "#F59E0B" : "#EF4444", fontWeight: 800, fontSize: "20px" }}>{selectedUser.creditScore}/100</span></div>}
                  {selectedUser.loanAmount !== undefined && <div style={s.detailItem}><span style={s.detailLabel}>Loan Amount</span><span style={{ ...s.detailValue, fontWeight: 700 }}>${selectedUser.loanAmount.toLocaleString()}</span></div>}
                </div>
              </div>
            )}
            {selectedUser.role === "Investor" && (
              <div style={s.roleSection}>
                <h3 style={s.roleSectionTitle}>Investment Summary</h3>
                <div style={s.detailGrid}>
                  {selectedUser.invested !== undefined && <div style={s.detailItem}><span style={s.detailLabel}>Total Invested</span><span style={{ ...s.detailValue, fontWeight: 700 }}>${selectedUser.invested.toLocaleString()}</span></div>}
                  {selectedUser.yield !== undefined && <div style={s.detailItem}><span style={s.detailLabel}>Yield Earned</span><span style={{ ...s.detailValue, color: "#10B981", fontWeight: 700 }}>${selectedUser.yield.toLocaleString()}</span></div>}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={s.actionsSection}>
              <h3 style={s.roleSectionTitle}>Quick Actions</h3>
              <div style={s.actionsList}>
                {selectedUser.kyc === "Pending" && (
                  <button style={s.actionBtn} onClick={() => handleApproveKyc(selectedUser.id)}>
                    <span>✅</span><div><div style={s.actionName}>Approve KYC</div><div style={s.actionDesc}>Manually verify identity documents</div></div>
                  </button>
                )}
                {selectedUser.status !== "Suspended" ? (
                  <button style={{ ...s.actionBtn, borderColor: "rgba(239,68,68,0.15)" }} onClick={() => setActionConfirm("suspend")}>
                    <span>🚫</span><div><div style={{ ...s.actionName, color: "#EF4444" }}>Suspend Account</div><div style={s.actionDesc}>Disable access to all portal features</div></div>
                  </button>
                ) : (
                  <button style={s.actionBtn} onClick={() => handleActivate(selectedUser.id)}>
                    <span>✅</span><div><div style={s.actionName}>Reactivate Account</div><div style={s.actionDesc}>Restore access to portal</div></div>
                  </button>
                )}
                <button style={s.actionBtn}>
                  <span>🔑</span><div><div style={s.actionName}>Reset Password</div><div style={s.actionDesc}>Send password reset link via email</div></div>
                </button>
                <button style={s.actionBtn}>
                  <span>📧</span><div><div style={s.actionName}>Send Message</div><div style={s.actionDesc}>Send a direct notification to this user</div></div>
                </button>
              </div>
            </div>

            {/* Suspend confirmation */}
            {actionConfirm === "suspend" && (
              <div style={s.confirmBar}>
                <p style={{ fontSize: "13px", color: "#EF4444", fontWeight: 600 }}>⚠️ Confirm account suspension?</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "12px", cursor: "pointer" }} onClick={() => setActionConfirm(null)}>Cancel</button>
                  <button style={{ padding: "6px 14px", borderRadius: "6px", border: "none", background: "#EF4444", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }} onClick={() => handleSuspend(selectedUser.id)}>Suspend</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "24px" },
  filters: { display: "flex", gap: "8px", marginBottom: "20px" },
  filterBtn: { padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", color: "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  filterActive: { border: "1px solid #7C3AED", background: "rgba(139,92,246,0.12)", color: "#7C3AED" },
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "700px" },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },
  roleBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
  kycBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 },
  statusBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 },

  panelOverlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 },
  panel: { position: "fixed" as const, top: 0, right: 0, bottom: 0, width: "440px", background: "rgba(10,15,30,0.97)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(75,85,99,0.2)", zIndex: 51, overflowY: "auto" as const, padding: "28px" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  panelTitle: { fontSize: "20px", fontWeight: 700, color: "#F9FAFB" },
  panelClose: { width: "36px", height: "36px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  profileCard: { display: "flex", alignItems: "center", gap: "16px", padding: "20px", borderRadius: "14px", background: "rgba(17,24,39,0.6)", border: "1px solid rgba(75,85,99,0.25)", marginBottom: "20px" },
  avatar: { width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "22px", color: "#fff", flexShrink: 0 },
  profileName: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB" },
  profileEmail: { fontSize: "13px", color: "#6B7280", marginTop: "2px" },

  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" },
  detailItem: { display: "flex", flexDirection: "column" as const, gap: "4px", padding: "14px", borderRadius: "10px", background: "rgba(31,41,55,0.3)", border: "1px solid rgba(75,85,99,0.15)" },
  detailLabel: { fontSize: "11px", color: "#6B7280", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  detailValue: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },

  roleSection: { marginBottom: "20px" },
  roleSectionTitle: { fontSize: "14px", fontWeight: 700, color: "#D1D5DB", marginBottom: "12px", textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  actionsSection: { marginBottom: "20px" },
  actionsList: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  actionBtn: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.15)", background: "rgba(31,41,55,0.2)", cursor: "pointer", textAlign: "left" as const, width: "100%", fontSize: "20px" },
  actionName: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  actionDesc: { fontSize: "12px", color: "#6B7280", marginTop: "2px" },

  confirmBar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" },
};
