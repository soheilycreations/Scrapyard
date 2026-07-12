"use client";

import { useState, useTransition } from "react";
import { createItem, updateItem, deleteItem } from "@/lib/actions/items";
import type { Item } from "@/lib/types";
import { PlusIcon, TrashIcon } from "@/components/icons";

export default function ItemManager({ items }: { items: Item[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!name.trim() || !rate) return;
    startTransition(async () => {
      await createItem(name, parseFloat(rate));
      setName("");
      setRate("");
      setShowAdd(false);
    });
  }

  function handleRateChange(id: string, value: string) {
    const rateNum = parseFloat(value);
    if (isNaN(rateNum)) return;
    startTransition(async () => {
      await updateItem(id, { default_rate: rateNum });
    });
  }

  function handleToggleActive(id: string, active: boolean) {
    startTransition(async () => {
      await updateItem(id, { active: !active });
    });
  }

  function handleDelete(id: string) {
    setDeleteError("");
    startTransition(async () => {
      const result = await deleteItem(id);
      if (result?.error) {
        setDeleteError(result.error);
        setConfirmDeleteId(null);
      } else {
        setConfirmDeleteId(null);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-400">Item Management</h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1 text-xs font-bold text-amber-400"
        >
          {showAdd ? "Cancel" : (<><PlusIcon size={14} /> Add item</>)}
        </button>
      </div>

      {showAdd && (
        <div className="mb-3 space-y-2 rounded-xl bg-slate-950/60 p-3">
          <input
            type="text"
            placeholder="Item name (e.g. Steel)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Default rate (Rs. per kg)"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="w-full rounded-lg bg-amber-500 py-2 text-sm font-bold text-slate-950 disabled:opacity-60"
          >
            Save item
          </button>
        </div>
      )}

      {deleteError && (
        <p className="mb-3 rounded-lg bg-red-950 border border-red-800 px-3 py-2 text-xs text-red-300">
          {deleteError}
        </p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl p-3 ${
              item.active ? "bg-slate-950/60" : "bg-slate-950/30 opacity-50"
            }`}
          >
            {confirmDeleteId === item.id ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-red-300">Delete &quot;{item.name}&quot;?</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="flex-1 text-sm font-semibold text-slate-100">{item.name}</span>
                <div className="flex items-center gap-1 text-sm text-slate-400">
                  <span>Rs.</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    defaultValue={item.default_rate}
                    onBlur={(e) => handleRateChange(item.id, e.target.value)}
                    className="w-16 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleToggleActive(item.id, item.active)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                    item.active ? "bg-slate-800 text-slate-300" : "bg-emerald-600 text-white"
                  }`}
                >
                  {item.active ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => {
                    setDeleteError("");
                    setConfirmDeleteId(item.id);
                  }}
                  aria-label="Delete item"
                  className="flex items-center justify-center rounded-lg bg-red-950 px-2.5 py-1.5 text-red-400 transition hover:bg-red-900"
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
