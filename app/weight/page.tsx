import Link from "next/link";
import { redirect } from "next/navigation";

import { BodyWeightTracker } from "@/components/weight/body-weight-tracker";
import { BlockedStateView } from "@/components/ui/flow-state-primitives";
import { PageCard, PageHeader, PageShell } from "@/components/ui/page-primitives";
import { auth0 } from "@/lib/auth0";
import { resolveProfileFlow } from "@/lib/profile/flow";
import { getBodyWeightHistory } from "@/lib/weight/api";

export default async function WeightPage() {
  const flowState = await resolveProfileFlow();

  if (flowState.status === "unauthenticated") {
    redirect("/auth/login");
  }

  if (flowState.status === "needs_onboarding") {
    redirect("/onboarding/profile");
  }

  if (flowState.status === "blocked") {
    return <BlockedStateView title="Body weight unavailable" message={flowState.message} />;
  }

  const session = await auth0.getSession();
  const auth0Id = session?.user.sub;

  if (!auth0Id) {
    redirect("/auth/login");
  }

  try {
    const entries = await getBodyWeightHistory(auth0Id);

    return (
      <PageShell>
        <PageCard width="content">
          <PageHeader
            eyebrow={
              <>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Dashboard
                </Link>{" "}
                / Body Weight
              </>
            }
            title="Body Weight"
            description="Log your daily check-ins and review your recent history."
          />
          <BodyWeightTracker initialEntries={entries} />
        </PageCard>
      </PageShell>
    );
  } catch (error) {
    return (
      <BlockedStateView
        title="Body weight unavailable"
        message={
          error instanceof Error ? error.message : "Unable to load your weight history right now."
        }
      />
    );
  }
}
