import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { resolveProfileFlow } from "@/lib/profile/flow";

function BlockedView({ message }: { message: string }) {
  return (
    <main className="container py-10 sm:py-16">
      <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">LiftIt</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Profile service unavailable</h1>
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

function SignInPrompt() {
  return (
    <main className="container py-10 sm:py-16">
      <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">LiftIt</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to continue</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Your session is required to load and create your profile.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
        </div>
      </section>
    </main>
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
    return <BlockedView message={flowState.message} />;
  }

  return <SignInPrompt />;
}
