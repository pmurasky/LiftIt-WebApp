import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { PageMessageCard } from "@/components/ui/page-message-card";
import { PageCard, PageDescription, PageEyebrow, PageShell, PageTitle } from "@/components/ui/page-primitives";
import { resolveProfileFlow } from "@/lib/profile/flow";

function BlockedView({ message }: { message: string }) {
  return (
    <PageShell spacing="roomy">
      <PageMessageCard
        title="Profile unavailable"
        message={message}
        actionHref="/"
        actionLabel="Retry"
      />
    </PageShell>
  );
}

export default async function ProfilePage() {
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
      <PageCard width="content">
        <PageEyebrow>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>{" "}
          / Profile
        </PageEyebrow>
        <PageTitle>Edit Profile</PageTitle>
        <PageDescription>Update your display preferences and optional personal details.</PageDescription>
        <ProfileEditForm profile={profile} />
      </PageCard>
    </PageShell>
  );
}
