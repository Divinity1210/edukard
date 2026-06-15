import { getProfile, getAgentProfile, getAgentReferrals } from "@/lib/data-access";
import ReferralsClient from "./ReferralsClient";

export default async function AgentReferralsPage() {
  const profile = await getProfile();
  
  if (!profile) {
    return <div>Not authenticated</div>;
  }

  const agentProfile = await getAgentProfile(profile.id);
  
  if (!agentProfile) {
    return <div>No agent profile found.</div>;
  }

  const referrals = await getAgentReferrals(agentProfile.id);

  return (
    <ReferralsClient 
      profile={profile} 
      agentProfile={agentProfile} 
      initialReferrals={referrals} 
    />
  );
}
