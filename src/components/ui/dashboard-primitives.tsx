import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function DashboardStatGrid({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-8 grid gap-4 sm:grid-cols-3", className)} {...props} />;
}

export function DashboardStatCard({ className, ...props }: ComponentPropsWithoutRef<"article">) {
  return <article className={cn("rounded-lg border bg-background/40 p-4", className)} {...props} />;
}

export function DashboardStatLabel({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn("text-sm font-medium text-muted-foreground", className)} {...props} />;
}

export function DashboardStatValue({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("mt-2 text-xl font-semibold", className)} {...props} />;
}
