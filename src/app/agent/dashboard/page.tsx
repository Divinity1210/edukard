import { getProfile, getAgentProfile, getAgentStats, getAgentReferrals } from "@/lib/data-access";
import DashboardClient from "./DashboardClient";

export default async function AgentDashboardPage() {
  const profile = await getProfile();
  
  if (!profile) {
    return <div>Not authenticated</div>;
  }

  const agentProfile = await getAgentProfile(profile.id);
  
  if (!agentProfile) {
    return <div>No agent profile found.</div>;
  }

  const stats = await getAgentStats(agentProfile.id);
  const referrals = await getAgentReferrals(agentProfile.id);

  return (
    <DashboardClient 
      profile={profile} 
      agentProfile={agentProfile} 
      stats={stats} 
      referrals={referrals} 
    />
  );
}
