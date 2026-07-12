"use client";

import { useState, useTransition } from "react";
import { updatePayment } from "@/lib/actions/loads";
import { formatRs } from "@/lib/format";
import { EditIcon } from "@/components/icons";

export default function PaymentEditor({
  loadId,
  currentPaid,
  total,
}: {
  loadId: string;
  currentPaid: number;
  total: number;
}) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(currentPaid));
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    const value = parseFloat(amount) || 0;
    startTransition(async () => {
      await updatePayment(loadId, value);
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 py-2.5 text-sm font-semibold text-amber-400 print:hidden"
      >
        <EditIcon size={16} /> Update payment / add balance payment
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 print:hidden">
      <label className="mb-1 block text-xs text-slate-400">
        Total paid so far (Rs.) - out of {formatRs(total)}
      </label>
      <input
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
