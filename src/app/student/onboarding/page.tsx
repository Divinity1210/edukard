import DashboardLayout from "@/components/DashboardLayout";
import { getProfile } from "@/lib/data-access";
import { integrationStatus } from "@/lib/integrations";
import SumsubVerification from "./SumsubVerification";
import OnboardingMock from "./OnboardingMock";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const profile = await getProfile();
  const userName = profile?.full_name || "Student";
  const sumsubLive = integrationStatus().sumsub;

  return (
    <DashboardLayout role="student" userName={userName}>
      {sumsubLive ? (
        <SumsubVerification kycStatus={profile?.kyc_status ?? null} />
      ) : (
        <OnboardingMock />
      )}
    </DashboardLayout>
  );
}
