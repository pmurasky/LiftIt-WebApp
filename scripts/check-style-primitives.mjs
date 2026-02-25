import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

const scanRoots = ["app", "src/components"];

const ignoredPaths = new Set([
  "src/components/ui/dashboard-primitives.tsx",
  "src/components/ui/flow-state-primitives.tsx",
  "src/components/ui/form-primitives.ts",
  "src/components/ui/nav-primitives.tsx",
  "src/components/ui/page-message-card.tsx",
  "src/components/ui/page-primitives.tsx",
]);

const forbiddenPatterns = [
  {
    className: "container py-8 sm:py-12",
    guidance: "Use PageShell instead of duplicating shell spacing",
  },
  {
    className: "container py-10 sm:py-16",
    guidance: "Use PageShell spacing=\"roomy\" for message pages",
  },
  {
    className: "rounded-xl border bg-card p-6 shadow-sm sm:p-8",
    guidance: "Use PageCard for shared card layout",
  },
  {
    className:
      "h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring",
    guidance: "Use formControlClass for shared form inputs",
  },
  {
    className: "flex h-11 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground",
    guidance: "Use formReadonlyValueClass for read-only form values",
  },
  {
    className: "text-sm text-muted-foreground transition hover:text-foreground",
    guidance: "Use appNavUserLinkClass for nav links",
  },
  {
    className: "mt-8 grid gap-5",
    guidance: "Use formLayoutClass for shared form layout spacing",
  },
  {
    className: "mt-8 grid gap-4 sm:grid-cols-3",
    guidance: "Use DashboardStatGrid for profile overview stats",
  },
  {
    className: "rounded-lg border bg-background/40 p-4",
    guidance: "Use DashboardStatCard for profile overview stats",
  },
];

async function listFiles(rootPath) {
  const entries = await readdir(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const absoluteEntryPath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(absoluteEntryPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!absoluteEntryPath.endsWith(".tsx") && !absoluteEntryPath.endsWith(".ts")) {
      continue;
    }

    files.push(absoluteEntryPath);
  }

  return files;
}

function toRelativePath(absolutePath) {
  return path.relative(projectRoot, absolutePath).replaceAll(path.sep, "/");
}

async function main() {
  const allFiles = [];

  for (const scanRoot of scanRoots) {
    const absoluteRoot = path.join(projectRoot, scanRoot);
    allFiles.push(...(await listFiles(absoluteRoot)));
  }

  const violations = [];

  for (const absolutePath of allFiles) {
    const relativePath = toRelativePath(absolutePath);

    if (ignoredPaths.has(relativePath) || relativePath.endsWith(".test.tsx")) {
      continue;
    }

    const content = await readFile(absolutePath, "utf8");

    for (const pattern of forbiddenPatterns) {
      if (content.includes(pattern.className)) {
        violations.push(`${relativePath}: ${pattern.guidance}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error("Style primitive guard failed. Replace duplicated class strings:");
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log("Style primitive guard passed.");
}

main().catch((error) => {
  console.error("Style primitive guard failed with an unexpected error.");
  console.error(error);
  process.exit(1);
});
