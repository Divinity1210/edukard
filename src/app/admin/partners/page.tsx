import DashboardLayout from "@/components/DashboardLayout";
import { getProfile, getAdminUniversities, getAdminAgents } from "@/lib/data-access";
import PartnersClient from "./PartnersClient";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const [profile, universities, agents] = await Promise.all([
    getProfile(),
    getAdminUniversities(),
    getAdminAgents(),
  ]);

  return (
    <DashboardLayout role="admin" userName={profile?.full_name || "Admin User"}>
      <PartnersClient universities={universities} agents={agents} />
    </DashboardLayout>
  );
}
