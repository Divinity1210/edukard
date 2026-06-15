import { getProfile, getStudentLoan, getRepaymentSchedule } from "@/lib/data-access";
import PaymentsClient from "./PaymentsClient";
import DashboardLayout from "@/components/DashboardLayout";

export default async function PaymentsPage() {
  const profile = await getProfile();
  
  if (!profile) {
    return <div>Not authenticated</div>;
  }

  const loan = await getStudentLoan(profile.id);
  const schedule = loan ? await getRepaymentSchedule(loan.id) : [];

  return (
    <PaymentsClient profile={profile} loan={loan} schedule={schedule} />
  );
}
