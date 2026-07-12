"use client";

import { useTransition } from "react";
import { deleteExpense } from "@/lib/actions/expenses";
import { formatRs, formatDateDisplay } from "@/lib/format";
import { TrashIcon } from "@/components/icons";
import type { Expense } from "@/lib/types";

export default function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteExpense(id);
    });
  }

  if (expenses.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-500">No expenses recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-3 text-sm font-bold text-slate-400">Recent expenses</h2>
      <div className="divide-y divide-slate-800">
        {expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-2 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-100">
                {e.note ? e.note : e.category}
              </p>
              <p className="truncate text-xs text-slate-500">
                {formatDateDisplay(e.expense_date)}
                {e.note ? ` · ${e.category}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-sm font-bold tabular-nums text-amber-400">
                {formatRs(e.amount)}
              </span>
              <button
                onClick={() => handleDelete(e.id)}
                disabled={isPending}
                aria-label="Delete expense"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-950 text-red-400 disabled:opacity-50"
              >
                <TrashIcon size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
