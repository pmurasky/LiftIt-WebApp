import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container py-16">
      <section className="rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">LiftIt Web</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Base Project Ready</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Next.js App Router + TypeScript + Tailwind + shadcn scaffolding is in place.
        </p>
        <div className="mt-6">
          <Button>Continue Setup</Button>
        </div>
      </section>
    </main>
  );
}
