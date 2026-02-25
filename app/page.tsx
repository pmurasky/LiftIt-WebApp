import { redirect } from "next/navigation";

import { BlockedStateView } from "@/components/ui/flow-state-primitives";
import { PageMessageCard } from "@/components/ui/page-message-card";
import { PageShell } from "@/components/ui/page-primitives";
import { resolveProfileFlow } from "@/lib/profile/flow";

function SignInPrompt() {
  return (
    <PageShell spacing="roomy">
      <PageMessageCard
        title="Sign in to continue"
        message="Your session is required to load and create your profile."
        actionHref="/auth/login"
        actionLabel="Log in"
      />
    </PageShell>
  );
}

export default async function Home() {
  const flowState = await resolveProfileFlow();

  if (flowState.status === "ready") {
    redirect("/dashboard");
  }

  if (flowState.status === "needs_onboarding") {
    redirect("/onboarding/profile");
  }

  if (flowState.status === "blocked") {
    return <BlockedStateView title="Profile service unavailable" message={flowState.message} />;
  }

  return <SignInPrompt />;
}
