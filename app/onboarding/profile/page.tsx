import { ProfileOnboardingForm } from "@/components/profile/profile-onboarding-form";

export default function ProfileOnboardingPage() {
  return (
    <main className="container py-8 sm:py-12">
      <section className="mx-auto max-w-2xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm text-muted-foreground">Step 1 of 1</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your profile</h1>
        <p className="mt-3 text-muted-foreground">
          This profile sets your training identity and display preferences. You can update
          optional fields later.
        </p>
        <ProfileOnboardingForm />
      </section>
    </main>
  );
}
