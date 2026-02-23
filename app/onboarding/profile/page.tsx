import { ProfileOnboardingForm } from "@/components/profile/profile-onboarding-form";
import { PageCard, PageDescription, PageEyebrow, PageShell, PageTitle } from "@/components/ui/page-primitives";

export default function ProfileOnboardingPage() {
  return (
    <PageShell>
      <PageCard width="content">
        <PageEyebrow>Step 1 of 1</PageEyebrow>
        <PageTitle>Create your profile</PageTitle>
        <PageDescription>
          This profile sets your training identity and display preferences. You can update
          optional fields later.
        </PageDescription>
        <ProfileOnboardingForm />
      </PageCard>
    </PageShell>
  );
}
