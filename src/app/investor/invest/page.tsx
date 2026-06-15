import { getProfile } from "@/lib/data-access";
import InvestClient from "./InvestClient";

export default async function InvestPage() {
  const profile = await getProfile();
  
  if (!profile) {
    return <div>Not authenticated</div>;
  }

  return (
    <InvestClient profile={profile} />
  );
}
