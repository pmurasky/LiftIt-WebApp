import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageShellProps extends ComponentPropsWithoutRef<"main"> {
  spacing?: "default" | "roomy";
}

const shellSpacingClass = {
  default: "py-8 sm:py-12",
  roomy: "py-10 sm:py-16",
} as const;

export function PageShell({ spacing = "default", className, ...props }: PageShellProps) {
  return <main className={cn("container", shellSpacingClass[spacing], className)} {...props} />;
}

interface PageCardProps extends ComponentPropsWithoutRef<"section"> {
  width?: "full" | "content";
}

const cardWidthClass = {
  full: "",
  content: "mx-auto max-w-2xl",
} as const;

export function PageCard({ width = "full", className, ...props }: PageCardProps) {
  return (
    <section
      className={cn("rounded-xl border bg-card p-6 shadow-sm sm:p-8", cardWidthClass[width], className)}
      {...props}
    />
  );
}

export function PageEyebrow({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export function PageTitle({ className, ...props }: ComponentPropsWithoutRef<"h1">) {
  return <h1 className={cn("mt-2 text-3xl font-semibold tracking-tight", className)} {...props} />;
}

export function PageDescription({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("mt-3 text-muted-foreground", className)} {...props} />;
}

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  descriptionClassName?: string;
}

export function PageHeader({ eyebrow, title, description, descriptionClassName }: PageHeaderProps) {
  return (
    <>
      {eyebrow ? <PageEyebrow>{eyebrow}</PageEyebrow> : null}
      <PageTitle>{title}</PageTitle>
      {description ? <PageDescription className={descriptionClassName}>{description}</PageDescription> : null}
    </>
  );
}
