import { redirect } from "next/navigation";

import { PageMessageCard } from "@/components/ui/page-message-card";
import { PageCard, PageDescription, PageEyebrow, PageShell, PageTitle } from "@/components/ui/page-primitives";
import { resolveProfileFlow } from "@/lib/profile/flow";

function BlockedView({ message }: { message: string }) {
  return (
    <PageShell spacing="roomy">
      <PageMessageCard
        title="Dashboard unavailable"
        message={message}
        actionHref="/"
        actionLabel="Retry"
      />
    </PageShell>
  );
}

export default async function DashboardPage() {
  const flowState = await resolveProfileFlow();

  if (flowState.status === "unauthenticated") {
    redirect("/auth/login");
  }

  if (flowState.status === "needs_onboarding") {
    redirect("/onboarding/profile");
  }

  if (flowState.status === "blocked") {
    return <BlockedView message={flowState.message} />;
  }

  const profile = flowState.profile;

  return (
    <PageShell>
      <PageCard>
        <PageEyebrow>LiftIt Dashboard</PageEyebrow>
        <PageTitle>Welcome, {profile.displayName ?? profile.username}</PageTitle>
        <PageDescription>
          Your profile is active. Training plan, workout logging, and progress modules can now build
          on this gated entry point.
        </PageDescription>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg border bg-background/40 p-4">
            <h2 className="text-sm font-medium text-muted-foreground">Units</h2>
            <p className="mt-2 text-xl font-semibold capitalize">{profile.unitsPreference}</p>
          </article>
          <article className="rounded-lg border bg-background/40 p-4">
            <h2 className="text-sm font-medium text-muted-foreground">Height</h2>
            <p className="mt-2 text-xl font-semibold">
              {profile.heightCm ? `${profile.heightCm} cm` : "Not set"}
            </p>
          </article>
          <article className="rounded-lg border bg-background/40 p-4">
            <h2 className="text-sm font-medium text-muted-foreground">Birthdate</h2>
            <p className="mt-2 text-xl font-semibold">{profile.birthdate ?? "Not set"}</p>
          </article>
        </div>
      </PageCard>
    </PageShell>
  );
}
