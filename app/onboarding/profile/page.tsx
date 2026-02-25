import { ProfileOnboardingForm } from "@/components/profile/profile-onboarding-form";
import { PageCard, PageHeader, PageShell } from "@/components/ui/page-primitives";

export default function ProfileOnboardingPage() {
  return (
    <PageShell>
      <PageCard width="content">
        <PageHeader
          eyebrow="Step 1 of 1"
          title="Create your profile"
          description="This profile sets your training identity and display preferences. You can update optional fields later."
        />
        <ProfileOnboardingForm />
      </PageCard>
    </PageShell>
  );
}
