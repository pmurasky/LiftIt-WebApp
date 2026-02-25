import { PageMessageCard } from "@/components/ui/page-message-card";
import { PageShell } from "@/components/ui/page-primitives";

interface BlockedStateViewProps {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

export function BlockedStateView({
  title,
  message,
  actionHref = "/",
  actionLabel = "Retry",
}: BlockedStateViewProps) {
  return (
    <PageShell spacing="roomy">
      <PageMessageCard title={title} message={message} actionHref={actionHref} actionLabel={actionLabel} />
    </PageShell>
  );
}
