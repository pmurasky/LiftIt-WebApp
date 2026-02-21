import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { Button } from "@/components/ui/button";
import { resolveProfileFlow } from "@/lib/profile/flow";

function BlockedView({ message }: { message: string }) {
  return (
    <main className="container py-10 sm:py-16">
      <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">LiftIt</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile unavailable</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{message}</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/">Retry</Link>
          </Button>
        </div>
      </section>
    </main>
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
    <main className="container py-8 sm:py-12">
      <section className="mx-auto max-w-2xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>{" "}
          / Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit Profile</h1>
        <p className="mt-3 text-muted-foreground">
          Update your display preferences and optional personal details.
        </p>
        <ProfileEditForm profile={profile} />
      </section>
    </main>
  );
}
