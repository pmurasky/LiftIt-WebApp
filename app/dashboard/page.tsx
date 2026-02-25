import { redirect } from "next/navigation";

import {
  DashboardStatCard,
  DashboardStatGrid,
  DashboardStatLabel,
  DashboardStatValue,
} from "@/components/ui/dashboard-primitives";
import { BlockedStateView } from "@/components/ui/flow-state-primitives";
import { PageCard, PageHeader, PageShell } from "@/components/ui/page-primitives";
import { resolveProfileFlow } from "@/lib/profile/flow";

export default async function DashboardPage() {
  const flowState = await resolveProfileFlow();

  if (flowState.status === "unauthenticated") {
    redirect("/auth/login");
  }

  if (flowState.status === "needs_onboarding") {
    redirect("/onboarding/profile");
  }

  if (flowState.status === "blocked") {
    return <BlockedStateView title="Dashboard unavailable" message={flowState.message} />;
  }

  const profile = flowState.profile;

  return (
    <PageShell>
      <PageCard>
        <PageHeader
          eyebrow="LiftIt Dashboard"
          title={<>Welcome, {profile.displayName ?? profile.username}</>}
          description="Your profile is active. Training plan, workout logging, and progress modules can now build on this gated entry point."
        />

        <DashboardStatGrid>
          <DashboardStatCard>
            <DashboardStatLabel>Units</DashboardStatLabel>
            <DashboardStatValue className="capitalize">{profile.unitsPreference}</DashboardStatValue>
          </DashboardStatCard>
          <DashboardStatCard>
            <DashboardStatLabel>Height</DashboardStatLabel>
            <DashboardStatValue>{profile.heightCm ? `${profile.heightCm} cm` : "Not set"}</DashboardStatValue>
          </DashboardStatCard>
          <DashboardStatCard>
            <DashboardStatLabel>Birthdate</DashboardStatLabel>
            <DashboardStatValue>{profile.birthdate ?? "Not set"}</DashboardStatValue>
          </DashboardStatCard>
        </DashboardStatGrid>
      </PageCard>
    </PageShell>
  );
}
