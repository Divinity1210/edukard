import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getCollectionsAccounts } from "@/lib/data-access";
import CollectionsClient from "./CollectionsClient";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const profile = await getProfile();
  const { accounts, totalComms } = await getCollectionsAccounts();

  return (
    <DashboardLayout role="admin" userName={profile?.full_name || "Admin User"}>
      <CollectionsClient accounts={accounts} totalComms={totalComms} />
    </DashboardLayout>
  );
}
