"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import type { UserRole } from "@/lib/types";

interface NavItem { label: string; href: string; icon: string; }

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  student: [
    { label: "Home", href: "/student/dashboard", icon: "🏠" },
    { label: "KYC Verification", href: "/student/onboarding", icon: "🛡️" },
    { label: "Credit Score", href: "/student/credit-score", icon: "📊" },
    { label: "Apply for Loan", href: "/student/apply", icon: "📝" },
    { label: "Application Status", href: "/student/application-status", icon: "📍" },
    { label: "Payments", href: "/student/payments", icon: "💳" },
    { label: "Payroll", href: "/student/payroll", icon: "💼" },
    { label: "Documents", href: "/student/documents", icon: "📄" },
    { label: "Help & Support", href: "/student/support", icon: "❓" },
    { label: "Settings", href: "/student/settings", icon: "⚙️" },
  ],
  investor: [
    { label: "Dashboard", href: "/investor/dashboard", icon: "📊" },
    { label: "Onboarding", href: "/investor/onboarding", icon: "🛡️" },
    { label: "Deposit", href: "/investor/deposit", icon: "🏦" },
    { label: "Invest", href: "/investor/invest", icon: "💰" },
    { label: "Portfolio", href: "/investor/portfolio", icon: "📈" },
    { label: "Transparency", href: "/investor/transparency", icon: "🔍" },
    { label: "Settings", href: "/investor/settings", icon: "⚙️" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Underwriting", href: "/admin/underwriting", icon: "📋" },
    { label: "Collections", href: "/admin/collections", icon: "⚠️" },
    { label: "Treasury", href: "/admin/treasury", icon: "🏦" },
    { label: "Users", href: "/admin/users", icon: "👥" },
    { label: "Partners", href: "/admin/partners", icon: "🤝" },
    { label: "Audit Log", href: "/admin/audit", icon: "📜" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ],
  university: [
    { label: "Dashboard", href: "/university/dashboard", icon: "📊" },
    { label: "Invoices", href: "/university/invoices", icon: "📄" },
    { label: "Settlements", href: "/university/settlements", icon: "🏦" },
    { label: "Settings", href: "/university/settings", icon: "⚙️" },
  ],
  agent: [
    { label: "Dashboard", href: "/agent/dashboard", icon: "📊" },
    { label: "Referrals", href: "/agent/referrals", icon: "👥" },
    { label: "Commissions", href: "/agent/commissions", icon: "💰" },
    { label: "Settings", href: "/agent/settings", icon: "⚙️" },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = { student: "Student Portal", investor: "Investor Portal", admin: "Admin Console", university: "University Portal", agent: "Partner Portal" };
const ROLE_COLORS: Record<UserRole, string> = { student: "#10B981", investor: "#14B8A6", admin: "#8B5CF6", university: "#F59E0B", agent: "#EC4899" };

export default function DashboardLayout({ children, role, userName }: { children: React.ReactNode; role: UserRole; userName: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = NAV_ITEMS[role];
  const color = ROLE_COLORS[role];
  const [showNotifs, setShowNotifs] = useState(false);

  const MOCK_NOTIFS = [
    { id: "n1", text: "New loan application submitted", time: "2 min ago", icon: "📝" },
    { id: "n2", text: "KYC verification approved", time: "1 hour ago", icon: "✅" },
    { id: "n3", text: "Settlement batch completed", time: "3 hours ago", icon: "🏦" },
    { id: "n4", text: "Commission payout processed", time: "Yesterday", icon: "💰" },
  ];

  return (
    <div style={s.layout}>
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.logoRow} onClick={() => router.push("/")}>
            <img src="/images/edukard-logo.png" alt="EduKard" style={s.logoImg} />
            <div style={{ ...s.portalLabel, color }}>{ROLE_LABELS[role]}</div>
          </div>
          {/* Notification Bell */}
          <div style={{ position: "relative" as const }}>
            <button style={s.bellBtn} onClick={() => setShowNotifs(!showNotifs)}>
              🔔
              <span style={s.bellBadge}>3</span>
            </button>
            {showNotifs && (
              <div style={s.notifDropdown}>
                <div style={s.notifHeader}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#F9FAFB" }}>Notifications</span>
                  <button style={{ background: "none", border: "none", color: color, fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>
                </div>
                {MOCK_NOTIFS.map(n => (
                  <div key={n.id} style={s.notifItem}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>{n.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: "#D1D5DB", lineHeight: 1.5 }}>{n.text}</div>
                      <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav style={s.nav}>
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <button key={item.href} onClick={() => router.push(item.href)} style={{
                ...s.navItem,
                ...(active ? { background: `${color}15`, color, fontWeight: 600, borderLeft: `3px solid ${color}`, boxShadow: `inset 0 0 20px ${color}08` } : {}),
              }}>
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.userCard}>
            <div style={{ ...s.avatar, background: `${color}20`, color, boxShadow: `0 0 12px ${color}15` }}>{userName.charAt(0)}</div>
            <div><div style={s.userName}>{userName}</div><div style={s.userRole}>{role}</div></div>
          </div>
          <button style={s.logoutBtn} onClick={() => router.push("/login")}>Sign Out</button>
        </div>
      </aside>

      <main style={s.main}><div style={s.mainInner}>{children}</div></main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  layout: { display: "flex", minHeight: "100vh", background: "#0A0F1E" },
  sidebar: { width: "260px", background: "rgba(10,15,30,0.95)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(75,85,99,0.15)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 20 },
  sidebarHeader: { padding: "24px 20px 20px", borderBottom: "1px solid rgba(75,85,99,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoRow: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "4px", cursor: "pointer" },
  logoImg: { height: "40px", objectFit: "contain" as const, flexShrink: 0 },
  logoText: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", letterSpacing: "-0.5px" },
  portalLabel: { fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" as const, marginTop: "2px" },
  nav: { flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" as const },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 16px", borderRadius: "8px", border: "none", borderLeft: "3px solid transparent", background: "transparent", cursor: "pointer", transition: "all 0.15s ease", fontSize: "14px", fontWeight: 500, color: "#6B7280", width: "100%", textAlign: "left" as const },
  navIcon: { fontSize: "18px", width: "24px", textAlign: "center" as const },
  sidebarFooter: { padding: "16px 16px 20px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  userCard: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  avatar: { width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "15px", flexShrink: 0 },
  userName: { fontSize: "13px", fontWeight: 600, color: "#F9FAFB" },
  userRole: { fontSize: "11px", color: "#6B7280", textTransform: "capitalize" as const },
  logoutBtn: { width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "13px", cursor: "pointer" },
  main: { flex: 1, marginLeft: "260px", minHeight: "100vh" },
  mainInner: { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  bellBtn: { position: "relative" as const, width: "36px", height: "36px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(31,41,55,0.3)", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  bellBadge: { position: "absolute" as const, top: "-3px", right: "-3px", width: "16px", height: "16px", borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: "9px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  notifDropdown: { position: "absolute" as const, top: "44px", right: 0, width: "300px", background: "rgba(10,15,30,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "hidden", zIndex: 30, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" },
  notifHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(75,85,99,0.15)" },
  notifItem: { display: "flex", gap: "12px", padding: "12px 16px", borderBottom: "1px solid rgba(75,85,99,0.1)", cursor: "pointer" },
};
