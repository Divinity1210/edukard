// Shared dark glassmorphism style tokens for inline styles
export const DARK = {
  // Cards
  card: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "16px", padding: "24px" } as React.CSSProperties,
  cardSolid: { background: "#111827", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "16px", padding: "24px" } as React.CSSProperties,

  // Typography
  title: { fontSize: "28px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" } as React.CSSProperties,
  subtitle: { fontSize: "15px", color: "#9CA3AF", marginBottom: "32px" } as React.CSSProperties,
  sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#F9FAFB", marginBottom: "16px" } as React.CSSProperties,

  // Inputs
  input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(75,85,99,0.4)", background: "rgba(31,41,55,0.6)", color: "#F9FAFB", fontSize: "15px", outline: "none" } as React.CSSProperties,
  label: { display: "block", fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "8px" } as React.CSSProperties,

  // Table
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, letterSpacing: "0.5px", borderBottom: "1px solid rgba(75,85,99,0.2)" } as React.CSSProperties,
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" } as React.CSSProperties,

  // Stat card
  statLabel: { fontSize: "13px", color: "#9CA3AF", fontWeight: 500 } as React.CSSProperties,

  // Colors
  green: "#10B981",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  amber: "#F59E0B",
  red: "#EF4444",
  teal: "#14B8A6",
};
