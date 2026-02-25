import { cn } from "@/lib/utils";

export const formControlClass =
  "h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

export function formControlClassName(hasError = false) {
  return cn(formControlClass, hasError && "border-destructive focus-visible:ring-destructive");
}

export const formLayoutClass = "mt-8 grid gap-5";

export const formReadonlyValueClass =
  "flex h-11 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground";

export const formHelperTextClass = "text-xs text-muted-foreground";

export const formFieldErrorClass = "text-sm text-destructive";

export const formErrorMessageClass =
  "rounded-md border border-destructive-border bg-destructive-soft px-3 py-2 text-sm text-destructive-foreground";

export const formSuccessMessageClass =
  "rounded-md border border-success-border bg-success-soft px-3 py-2 text-sm text-success-foreground";
