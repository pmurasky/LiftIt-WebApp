import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { resolveProfileFlow } from "@/lib/profile/flow";

function BlockedView({ message }: { message: string }) {
  return (
    <main className="container py-10 sm:py-16">
      <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">LiftIt</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard unavailable</h1>
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
    <main className="container py-8 sm:py-12">
      <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">LiftIt Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Welcome, {profile.displayName ?? profile.username}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your profile is active. Training plan, workout logging, and progress modules can now
          build on this gated entry point.
        </p>

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
      </section>
    </main>
  );
}
