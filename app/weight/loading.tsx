import { PageCard, PageHeader, PageShell } from "@/components/ui/page-primitives";

export default function LoadingWeightPage() {
  return (
    <PageShell>
      <PageCard width="content">
        <PageHeader
          eyebrow="Dashboard / Body Weight"
          title="Body Weight"
          description="Loading your weight history..."
        />
      </PageCard>
    </PageShell>
  );
}
