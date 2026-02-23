import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageCard, PageDescription, PageEyebrow, PageTitle } from "@/components/ui/page-primitives";

interface PageMessageCardProps {
  title: string;
  message: string;
  actionHref: string;
  actionLabel: string;
  eyebrow?: string;
}

export function PageMessageCard({
  title,
  message,
  actionHref,
  actionLabel,
  eyebrow = "LiftIt",
}: PageMessageCardProps) {
  return (
    <PageCard>
      <PageEyebrow>{eyebrow}</PageEyebrow>
      <PageTitle>{title}</PageTitle>
      <PageDescription className="max-w-2xl">{message}</PageDescription>
      <div className="mt-6">
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
    </PageCard>
  );
}
