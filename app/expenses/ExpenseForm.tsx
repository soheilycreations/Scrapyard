"use client";

import { useState, useTransition } from "react";
import { createExpense } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import PrimaryButton from "@/components/PrimaryButton";
import { PlusIcon, CheckIcon } from "@/components/icons";

export default function ExpenseForm() {
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError("");
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Amount එකක් දාන්න");
      return;
    }
    startTransition(async () => {
      try {
        await createExpense({ expense_date: date, category, amount: amt, note });
        setAmount("");
        setNote("");
        setShowForm(false);
      } catch (e: any) {
        setError(e.message || "Save වුනේ නැහැ");
      }
    });
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-700 py-3.5 text-sm font-bold text-amber-400"
      >
        <PlusIcon size={16} /> Add expense
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-400">Amount (Rs.)</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-base focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-400">Note (optional)</label>
        <input
          type="text"
          placeholder="e.g. Driver salary - June"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-950 border border-red-800 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <PrimaryButton onClick={handleSubmit} disabled={isPending}>
            <CheckIcon size={16} strokeWidth={3} />
            {isPending ? "Saving..." : "Save expense"}
          </PrimaryButton>
        </div>
        <button
          onClick={() => setShowForm(false)}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
