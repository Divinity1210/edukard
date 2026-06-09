import { getProfile, getUniversityContext, getUniversityInvoices } from "@/lib/data-access";
import InvoicesClient from "./InvoicesClient";

export default async function UniversityInvoicesPage() {
  const profile = await getProfile();
  
  if (!profile) {
    return <div>Not authenticated</div>;
  }

  const uni = await getUniversityContext();
  if (!uni) return <div>No university context</div>;

  const invoices = await getUniversityInvoices(uni.id);

  return (
    <InvoicesClient profile={profile} invoices={invoices} />
  );
}
