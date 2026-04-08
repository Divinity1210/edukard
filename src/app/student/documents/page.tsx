"use client";

import DashboardLayout from "@/components/DashboardLayout";

const DOCUMENTS = [
  { name: "Loan Agreement — University of Toronto", type: "PDF", date: "Feb 10, 2026", status: "Signed", size: "245 KB" },
  { name: "PAD Authorization Mandate", type: "PDF", date: "Feb 25, 2026", status: "Active", size: "128 KB" },
  { name: "KYC Identity Verification", type: "PDF", date: "Jan 20, 2026", status: "Verified", size: "312 KB" },
  { name: "Tuition Invoice — Winter 2026", type: "PDF", date: "Feb 5, 2026", status: "Uploaded", size: "89 KB" },
  { name: "Employment Verification Letter", type: "PDF", date: "Jan 22, 2026", status: "Verified", size: "156 KB" },
  { name: "Student Enrollment Confirmation", type: "PDF", date: "Jan 15, 2026", status: "Uploaded", size: "74 KB" },
];

export default function DocumentsPage() {
  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <h1 style={s.title}>Documents</h1>
      <p style={s.subtitle}>View and manage your uploaded documents and signed agreements.</p>

      <div style={s.uploadCard}>
        <div style={s.uploadIcon}>📤</div>
        <div><strong style={s.uploadTitle}>Upload a document</strong><p style={s.uploadDesc}>Drag and drop or click to upload tuition invoices, bank statements, or other documents.</p></div>
        <button style={s.uploadBtn}>Choose File</button>
      </div>

      <div style={s.list}>
        {DOCUMENTS.map((doc) => (
          <div key={doc.name} style={s.docCard}>
            <div style={s.docIcon}>📄</div>
            <div style={s.docInfo}>
              <div style={s.docName}>{doc.name}</div>
              <div style={s.docMeta}>{doc.type} · {doc.size} · {doc.date}</div>
            </div>
            <span style={{ ...s.docStatus, background: doc.status === "Signed" || doc.status === "Active" ? "rgba(16,185,129,0.12)" : doc.status === "Verified" ? "rgba(59,130,246,0.12)" : "#F8F9FB", color: doc.status === "Signed" || doc.status === "Active" ? "#10B981" : doc.status === "Verified" ? "#10B981" : "#6B7280" }}>
              {doc.status}
            </span>
            <button style={s.downloadBtn}>↓</button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "24px" },
  uploadCard: { display: "flex", alignItems: "center", gap: "16px", background: "rgba(16,185,129,0.12)", border: "2px dashed rgba(16,185,129,0.3)", borderRadius: "14px", padding: "20px 24px", marginBottom: "28px" },
  uploadIcon: { fontSize: "28px" },
  uploadTitle: { fontSize: "15px", color: "#F9FAFB" },
  uploadDesc: { fontSize: "13px", color: "#6B7280", marginTop: "4px" },
  uploadBtn: { padding: "10px 20px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 },
  list: { display: "flex", flexDirection: "column" as const, gap: "8px" },
  docCard: { display: "flex", alignItems: "center", gap: "14px", background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "12px", padding: "16px 20px" },
  docIcon: { fontSize: "24px", flexShrink: 0 },
  docInfo: { flex: 1 },
  docName: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },
  docMeta: { fontSize: "12px", color: "#6B7280", marginTop: "2px" },
  docStatus: { padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, flexShrink: 0 },
  downloadBtn: { width: "36px", height: "36px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "rgba(17,24,39,0.6)", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
};
