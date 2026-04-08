"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MOCK_REPAYMENT_SCHEDULE, MOCK_LOAN } from "@/lib/mock-data";
import { formatCAD, formatDate } from "@/lib/calculations";
import { useState } from "react";

export default function PaymentsPage() {
  const schedule = MOCK_REPAYMENT_SCHEDULE;
  const loan = MOCK_LOAN;
  const [calendarMonth, setCalendarMonth] = useState(4);
  const [calendarYear] = useState(2026);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const nextPayment = schedule.find((r) => r.status === "scheduled");
  const overduePayments = schedule.filter((r) => r.status === "late");

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const monthLabel = new Date(calendarYear, calendarMonth, 1).toLocaleString("en-CA", { month: "long", year: "numeric" });

  const paymentDays = schedule.map((r) => {
    const d = new Date(r.due_date);
    if (d.getMonth() === calendarMonth && d.getFullYear() === calendarYear) {
      return { day: d.getDate(), status: r.status, amount: r.total_payment };
    }
    return null;
  }).filter(Boolean) as { day: number; status: string; amount: number }[];

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const handlePay = () => {
    setPaymentSuccess(true);
    setTimeout(() => { setPaymentSuccess(false); setShowPayModal(false); }, 3000);
  };

  return (
    <DashboardLayout role="student" userName="Amara Okafor">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h1 style={s.title}>Payment Management</h1>
          <p style={s.subtitle}>Track your repayment schedule, upcoming payments, and manage your Pre-Authorized Debit (PAD).</p>
        </div>
        <button style={s.makePayBtn} onClick={() => setShowPayModal(true)}>💳 Make a Payment</button>
      </div>

      {/* PAD Status Card */}
      <div style={s.padCard}>
        <div style={s.padHeader}>
          <div>
            <h3 style={s.padTitle}>Pre-Authorized Debit (PAD)</h3>
            <p style={s.padDesc}>Automated monthly payments from your linked bank account</p>
          </div>
          <span style={s.padActive}>● Active</span>
        </div>
        <div style={s.padDetails}>
          <div style={s.padDetail}><span style={s.pdLabel}>Bank</span><span style={s.pdValue}>TD Canada Trust ****4521</span></div>
          <div style={s.padDetail}><span style={s.pdLabel}>Amount</span><span style={s.pdValue}>{formatCAD(loan.monthly_payment)}/mo</span></div>
          <div style={s.padDetail}><span style={s.pdLabel}>Next Debit</span><span style={s.pdValue}>{formatDate("2026-05-01")}</span></div>
          <div style={s.padDetail}><span style={s.pdLabel}>Mandate Signed</span><span style={s.pdValue}>{formatDate("2026-02-25")}</span></div>
        </div>
      </div>

      {/* Payment Reminders */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Payment Reminders</h2>
        <div style={s.remindersGrid}>
          {/* Upcoming */}
          {nextPayment && (
            <div style={s.reminderCard}>
              <div style={s.reminderIcon}>📅</div>
              <div style={{ flex: 1 }}>
                <div style={s.reminderTitle}>Upcoming Payment</div>
                <div style={s.reminderAmount}>{formatCAD(nextPayment.total_payment)}</div>
                <div style={s.reminderDate}>Due {formatDate(nextPayment.due_date)}</div>
              </div>
              <div style={s.reminderBadge}>
                <span style={s.reminderDays}>
                  {Math.ceil((new Date(nextPayment.due_date).getTime() - Date.now()) / 86400000)} days
                </span>
              </div>
            </div>
          )}
          {/* Overdue */}
          {overduePayments.map((op) => (
            <div key={op.id} style={{ ...s.reminderCard, borderColor: "rgba(239,68,68,0.25)", borderLeft: "4px solid #EF4444" }}>
              <div style={s.reminderIcon}>⚠️</div>
              <div style={{ flex: 1 }}>
                <div style={{ ...s.reminderTitle, color: "#EF4444" }}>Overdue Payment</div>
                <div style={s.reminderAmount}>{formatCAD(op.total_payment)}</div>
                <div style={s.reminderDate}>Was due {formatDate(op.due_date)}</div>
              </div>
              <button style={s.payNowBtn}>Pay Now →</button>
            </div>
          ))}
          {overduePayments.length === 0 && (
            <div style={{ ...s.reminderCard, borderLeft: "4px solid #10B981" }}>
              <div style={s.reminderIcon}>✅</div>
              <div>
                <div style={{ ...s.reminderTitle, color: "#10B981" }}>All Caught Up</div>
                <div style={s.reminderDate}>No overdue payments. Great job!</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Late Fee Disclosure */}
      <div style={s.feeCard}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <span style={{ fontSize: "20px" }}>💡</span>
          <strong style={{ fontSize: "14px", color: "#F59E0B" }}>Late Payment Fee Disclosure</strong>
        </div>
        <p style={s.feeText}>
          Payments received after the due date may incur a late fee of <strong>$25 or 3% of the payment amount</strong>, whichever is less.
          If your payment is more than 30 days late, additional collection actions may apply as outlined in your Loan Agreement.
        </p>
      </div>

      {/* PAYMENT CALENDAR */}
      <div style={s.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={s.sectionTitle}>Payment Calendar</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setCalendarMonth((m) => Math.max(0, m - 1))} style={s.calNav}>←</button>
            <span style={s.calMonth}>{monthLabel}</span>
            <button onClick={() => setCalendarMonth((m) => Math.min(11, m + 1))} style={s.calNav}>→</button>
          </div>
        </div>
        <div style={s.calCard}>
          <div style={s.calHeader}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} style={s.calHeaderCell}>{d}</div>
            ))}
          </div>
          <div style={s.calGrid}>
            {calendarCells.map((day, i) => {
              const payment = day ? paymentDays.find((p) => p.day === day) : null;
              const isToday = day === new Date().getDate() && calendarMonth === new Date().getMonth() && calendarYear === new Date().getFullYear();
              return (
                <div key={i} style={{
                  ...s.calCell,
                  ...(day ? {} : { visibility: "hidden" as const }),
                  ...(isToday ? { border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.06)" } : {}),
                  ...(payment ? { border: `1px solid ${payment.status === "completed" ? "rgba(16,185,129,0.3)" : payment.status === "late" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`, background: payment.status === "completed" ? "rgba(16,185,129,0.06)" : payment.status === "late" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)" } : {}),
                }}>
                  <span style={{ ...s.calDay, ...(isToday ? { color: "#10B981", fontWeight: 700 } : {}) }}>{day}</span>
                  {payment && (
                    <div style={s.calPayment}>
                      <span style={{ fontSize: "10px", color: payment.status === "completed" ? "#10B981" : payment.status === "late" ? "#EF4444" : "#F59E0B" }}>
                        {payment.status === "completed" ? "✓ Paid" : payment.status === "late" ? "⚠ Late" : "Due"}
                      </span>
                      <span style={s.calAmount}>{formatCAD(payment.amount)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={s.calLegend}>
            <span style={s.legendItem}><span style={{ ...s.legendDot, background: "#10B981" }} /> Paid</span>
            <span style={s.legendItem}><span style={{ ...s.legendDot, background: "#F59E0B" }} /> Due</span>
            <span style={s.legendItem}><span style={{ ...s.legendDot, background: "#EF4444" }} /> Overdue</span>
          </div>
        </div>
      </div>

      {/* AMORTIZATION TABLE */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Amortization Schedule</h2>
        <div style={s.tableCard}>
          <table style={s.table}>
            <thead><tr>{["#", "Due Date", "Principal", "Interest", "Total", "Balance", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.id}>
                  <td style={s.td}>{row.payment_number}</td>
                  <td style={s.td}>{formatDate(row.due_date)}</td>
                  <td style={s.td}>{formatCAD(row.principal)}</td>
                  <td style={s.td}>{formatCAD(row.interest)}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{formatCAD(row.total_payment)}</td>
                  <td style={s.td}>{formatCAD(row.remaining_balance)}</td>
                  <td style={s.td}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                      background: row.status === "completed" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                      color: row.status === "completed" ? "#10B981" : "#F59E0B",
                    }}>
                      {row.status === "completed" ? "✓ Paid" : "Upcoming"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Make Payment Modal */}
      {showPayModal && (
        <div style={s.overlay} onClick={() => { setShowPayModal(false); setPaymentSuccess(false); }}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            {!paymentSuccess ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#F9FAFB" }}>Make a Payment</h2>
                  <button style={s.modalClose} onClick={() => setShowPayModal(false)}>✕</button>
                </div>

                {/* Payment selection */}
                <div style={s.payOption}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", color: "#6B7280" }}>Next Scheduled Payment</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#10B981", marginTop: "4px" }}>{nextPayment ? formatCAD(nextPayment.total_payment) : "—"}</div>
                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "4px" }}>Due {nextPayment ? formatDate(nextPayment.due_date) : "—"}</div>
                  </div>
                  <div style={{ fontSize: "40px" }}>📅</div>
                </div>

                {/* Breakdown */}
                {nextPayment && (
                  <div style={s.payBreakdown}>
                    <div style={s.payRow}><span>Principal</span><strong style={{ color: "#F9FAFB" }}>{formatCAD(nextPayment.principal)}</strong></div>
                    <div style={s.payRow}><span>Interest</span><strong style={{ color: "#F59E0B" }}>{formatCAD(nextPayment.interest)}</strong></div>
                    <div style={{ ...s.payRow, borderTop: "1px solid rgba(75,85,99,0.2)", paddingTop: "10px", marginTop: "4px" }}><span style={{ fontWeight: 700, color: "#F9FAFB" }}>Total Payment</span><strong style={{ color: "#10B981", fontSize: "18px" }}>{formatCAD(nextPayment.total_payment)}</strong></div>
                  </div>
                )}

                {/* Bank selection */}
                <div style={s.bankSelect}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#D1D5DB", marginBottom: "10px" }}>Pay From</div>
                  <div style={s.bankCard}>
                    <div style={{ fontSize: "24px" }}>🏦</div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#F9FAFB" }}>TD Canada Trust</div>
                      <div style={{ fontSize: "12px", color: "#6B7280" }}>Chequing ****4521</div>
                    </div>
                    <span style={{ marginLeft: "auto", padding: "4px 10px", borderRadius: "6px", background: "rgba(16,185,129,0.12)", color: "#10B981", fontSize: "11px", fontWeight: 700 }}>DEFAULT</span>
                  </div>
                </div>

                <button style={s.confirmPayBtn} onClick={handlePay}>Confirm Payment →</button>
                <p style={{ fontSize: "11px", color: "#6B7280", textAlign: "center" as const, marginTop: "12px", lineHeight: 1.6 }}>By confirming, you authorize EduKard to debit {nextPayment ? formatCAD(nextPayment.total_payment) : "—"} from your linked bank account via Pre-Authorized Debit (PAD).</p>
              </>
            ) : (
              <div style={{ textAlign: "center" as const, padding: "24px 0" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#F9FAFB", marginBottom: "8px" }}>Payment Successful!</h2>
                <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
                  Your payment of <strong style={{ color: "#10B981" }}>{nextPayment ? formatCAD(nextPayment.total_payment) : "—"}</strong> has been submitted.
                </p>
                <div style={{ padding: "12px 20px", borderRadius: "10px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", marginTop: "16px", display: "inline-block" }}>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>Receipt Number</div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#10B981", fontFamily: "monospace" }}>EK-PAY-{Date.now().toString().slice(-8)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const s: Record<string, React.CSSProperties> = {
  title: { fontSize: "26px", fontWeight: 800, color: "#F9FAFB" },
  subtitle: { fontSize: "15px", color: "#6B7280", marginBottom: "28px" },

  /* PAD */
  padCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px", marginBottom: "24px", borderLeft: "4px solid #059669" },
  padHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
  padTitle: { fontSize: "16px", fontWeight: 700, color: "#F9FAFB" },
  padDesc: { fontSize: "13px", color: "#6B7280", marginTop: "4px" },
  padActive: { fontSize: "12px", fontWeight: 700, color: "#10B981", padding: "4px 12px", borderRadius: "100px", background: "rgba(16,185,129,0.12)" },
  padDetails: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" },
  padDetail: { display: "flex", flexDirection: "column" as const, gap: "4px" },
  pdLabel: { fontSize: "12px", color: "#6B7280" },
  pdValue: { fontSize: "14px", fontWeight: 600, color: "#F9FAFB" },

  /* Reminders */
  section: { marginBottom: "28px" },
  sectionTitle: { fontSize: "17px", fontWeight: 700, color: "#F9FAFB", marginBottom: "14px" },
  remindersGrid: { display: "flex", flexDirection: "column" as const, gap: "12px" },
  reminderCard: { display: "flex", alignItems: "center", gap: "16px", padding: "18px 22px", borderRadius: "14px", background: "rgba(17,24,39,0.6)", border: "1px solid rgba(75,85,99,0.25)", borderLeft: "4px solid #F59E0B" },
  reminderIcon: { fontSize: "28px", flexShrink: 0 },
  reminderTitle: { fontSize: "13px", fontWeight: 600, color: "#F59E0B", marginBottom: "4px" },
  reminderAmount: { fontSize: "20px", fontWeight: 800, color: "#F9FAFB" },
  reminderDate: { fontSize: "13px", color: "#6B7280", marginTop: "2px" },
  reminderBadge: { textAlign: "right" as const },
  reminderDays: { fontSize: "13px", fontWeight: 700, color: "#F59E0B", padding: "4px 12px", borderRadius: "6px", background: "rgba(245,158,11,0.12)" },
  payNowBtn: { padding: "8px 18px", borderRadius: "8px", background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const },

  /* Fee disclosure */
  feeCard: { padding: "18px 22px", borderRadius: "14px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", marginBottom: "24px" },
  feeText: { fontSize: "13px", color: "#D1D5DB", lineHeight: 1.7 },

  /* Calendar */
  calNav: { padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "14px", cursor: "pointer" },
  calMonth: { fontSize: "15px", fontWeight: 700, color: "#F9FAFB", padding: "6px 16px" },
  calCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", padding: "24px" },
  calHeader: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" },
  calHeaderCell: { textAlign: "center" as const, fontSize: "12px", fontWeight: 600, color: "#6B7280", padding: "8px 0" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" },
  calCell: { minHeight: "70px", borderRadius: "10px", padding: "8px", border: "1px solid rgba(75,85,99,0.1)", background: "rgba(31,41,55,0.15)", display: "flex", flexDirection: "column" as const, gap: "4px" },
  calDay: { fontSize: "13px", color: "#D1D5DB", fontWeight: 500 },
  calPayment: { display: "flex", flexDirection: "column" as const, gap: "2px" },
  calAmount: { fontSize: "11px", fontWeight: 700, color: "#D1D5DB" },
  calLegend: { display: "flex", gap: "20px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(75,85,99,0.15)" },
  legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6B7280" },
  legendDot: { width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" },

  /* Table */
  tableCard: { background: "rgba(17,24,39,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(75,85,99,0.25)", borderRadius: "14px", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: "650px" },
  th: { padding: "14px 16px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textAlign: "left" as const, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(75,85,99,0.2)" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#D1D5DB", borderBottom: "1px solid rgba(75,85,99,0.1)" },

  makePayBtn: { padding: "12px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap" as const, boxShadow: "0 0 20px rgba(16,185,129,0.2)" },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "rgba(17,24,39,0.95)", border: "1px solid rgba(75,85,99,0.3)", borderRadius: "16px", padding: "32px", maxWidth: "480px", width: "90%" },
  modalClose: { width: "32px", height: "32px", borderRadius: "8px", border: "1px solid rgba(75,85,99,0.25)", background: "transparent", color: "#6B7280", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  payOption: { display: "flex", alignItems: "center", gap: "16px", padding: "20px", borderRadius: "12px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", marginBottom: "16px" },
  payBreakdown: { padding: "16px", borderRadius: "12px", background: "rgba(31,41,55,0.3)", marginBottom: "20px" },
  payRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", color: "#6B7280" },
  bankSelect: { marginBottom: "20px" },
  bankCard: { display: "flex", alignItems: "center", gap: "14px", padding: "16px", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.15)", background: "rgba(16,185,129,0.04)" },
  confirmPayBtn: { width: "100%", padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff", fontSize: "16px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.25)" },
};
