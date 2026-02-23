import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export function AppNav({ className, ...props }: ComponentPropsWithoutRef<"nav">) {
  return <nav className={cn("border-b bg-card", className)} {...props} />;
}

export function AppNavContainer({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("container flex h-16 items-center justify-between", className)} {...props} />
  );
}

export function AppNavBrand({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("text-lg font-semibold", className)} {...props} />;
}

export const appNavUserLinkClass = "text-sm text-muted-foreground transition hover:text-foreground";

export function AppNavUserText({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return <span className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
