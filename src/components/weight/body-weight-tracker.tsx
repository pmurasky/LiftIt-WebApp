"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formControlClassName,
  formErrorMessageClass,
  formFieldErrorClass,
  formLayoutClass,
  formSuccessMessageClass,
} from "@/components/ui/form-primitives";
import {
  type BodyWeightActionState,
  initialBodyWeightActionState,
} from "@/lib/weight/action-state";
import { createBodyWeightEntryAction } from "@/lib/weight/actions";
import type { BodyWeightEntry } from "@/lib/weight/api";

interface BodyWeightTrackerProps {
  initialEntries: BodyWeightEntry[];
}

function compareEntriesNewestFirst(a: BodyWeightEntry, b: BodyWeightEntry) {
  return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatWeight(value: number) {
  return `${value.toFixed(2).replace(/\.00$/, "")} lb`;
}

export function BodyWeightTracker({ initialEntries }: BodyWeightTrackerProps) {
  const [state, formAction, isPending] = useActionState<BodyWeightActionState, FormData>(
    createBodyWeightEntryAction,
    initialBodyWeightActionState
  );

  const [entries, setEntries] = useState(() => [...initialEntries].sort(compareEntriesNewestFirst));
  const [weightInput, setWeightInput] = useState("");
  const [dateInput, setDateInput] = useState(getTodayDateValue());

  const savedEntryId = state.savedEntry?.id;

  useEffect(() => {
    if (state.status !== "success" || !state.savedEntry) {
      return;
    }

    setEntries((previousEntries) => {
      if (previousEntries.some((entry) => entry.id === state.savedEntry?.id)) {
        return previousEntries;
      }

      return [...previousEntries, state.savedEntry as BodyWeightEntry].sort(compareEntriesNewestFirst);
    });

    setWeightInput("");
    setDateInput(getTodayDateValue());
  }, [savedEntryId, state.savedEntry, state.status]);

  const tableRows = useMemo(() => {
    return entries.map((entry) => (
      <tr key={entry.id} className="border-b border-border/70 last:border-0">
        <td className="px-3 py-3 text-sm sm:px-4">{entry.date}</td>
        <td className="px-3 py-3 text-sm font-medium sm:px-4">{formatWeight(entry.weight)}</td>
      </tr>
    ));
  }, [entries]);

  return (
    <div className="mt-8 grid gap-8">
      <form action={formAction} className={formLayoutClass}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto] sm:items-end">
          <div className="grid gap-2">
            <label htmlFor="weight" className="text-sm font-medium">
              Weight (lb) *
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={weightInput}
              onChange={(event) => setWeightInput(event.target.value)}
              className={formControlClassName(Boolean(state.fieldErrors.weight))}
              aria-invalid={Boolean(state.fieldErrors.weight)}
              placeholder="185.2"
              required
            />
            {state.fieldErrors.weight ? <p className={formFieldErrorClass}>{state.fieldErrors.weight}</p> : null}
          </div>

          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">
              Date *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={dateInput}
              onChange={(event) => setDateInput(event.target.value)}
              className={formControlClassName(Boolean(state.fieldErrors.date))}
              aria-invalid={Boolean(state.fieldErrors.date)}
              required
            />
            {state.fieldErrors.date ? <p className={formFieldErrorClass}>{state.fieldErrors.date}</p> : null}
          </div>

          <div className="pt-2 sm:pt-0">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>

        {state.status === "success" && state.message ? (
          <p className={formSuccessMessageClass}>{state.message}</p>
        ) : null}

        {state.status === "error" && state.message ? (
          <p className={formErrorMessageClass}>{state.message}</p>
        ) : null}
      </form>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">History</h2>
        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
            No weight entries yet. Add your first check-in above to start building your history.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full border-collapse">
              <thead className="bg-muted/40">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-4">
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
