import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { BlockedStateView } from "@/components/ui/flow-state-primitives";
import { PageCard, PageHeader, PageShell } from "@/components/ui/page-primitives";
import { resolveProfileFlow } from "@/lib/profile/flow";

export default async function ProfilePage() {
  const flowState = await resolveProfileFlow();

  if (flowState.status === "unauthenticated") {
    redirect("/auth/login");
  }

  if (flowState.status === "needs_onboarding") {
    redirect("/onboarding/profile");
  }

  if (flowState.status === "blocked") {
    return <BlockedStateView title="Profile unavailable" message={flowState.message} />;
  }

  const profile = flowState.profile;

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
              / Profile
            </>
          }
          title="Edit Profile"
          description="Update your display preferences and optional personal details."
        />
        <ProfileEditForm profile={profile} />
      </PageCard>
    </PageShell>
  );
}
