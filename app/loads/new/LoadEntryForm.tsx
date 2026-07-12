"use client";

import { useMemo, useState, useTransition } from "react";
import { createLoadAndRedirect } from "@/lib/actions/loads";
import { createSupplier } from "@/lib/actions/suppliers";
import { formatRs, todayISO } from "@/lib/format";
import type { Item, Supplier } from "@/lib/types";
import PrimaryButton from "@/components/PrimaryButton";
import { PlusIcon, CheckIcon } from "@/components/icons";

type SelectedItem = {
  item_id: string;
  name: string;
  weight: string; // keep as string for smooth mobile typing
  rate: string;
};

export default function LoadEntryForm({
  suppliers: initialSuppliers,
  items,
}: {
  suppliers: Supplier[];
  items: Item[];
}) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [supplierId, setSupplierId] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierPhone, setNewSupplierPhone] = useState("");

  const [selected, setSelected] = useState<Record<string, SelectedItem>>({});
  const [loadDate, setLoadDate] = useState(todayISO());
  const [paidAmount, setPaidAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredSuppliers = useMemo(() => {
    if (!supplierSearch.trim()) return suppliers;
    const q = supplierSearch.toLowerCase();
    return suppliers.filter((s) => s.name.toLowerCase().includes(q));
  }, [suppliers, supplierSearch]);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  function toggleItem(item: Item) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = {
          item_id: item.id,
          name: item.name,
          weight: "",
          rate: String(item.default_rate),
        };
      }
      return next;
    });
  }

  function updateField(itemId: string, field: "weight" | "rate", value: string) {
    setSelected((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  }

  const lineItems = Object.values(selected).map((s) => {
    const weight = parseFloat(s.weight) || 0;
    const rate = parseFloat(s.rate) || 0;
    return { ...s, weight, rate, subtotal: weight * rate };
  });

  const grandTotal = lineItems.reduce((sum, li) => sum + li.subtotal, 0);
  const paid = parseFloat(paidAmount) || 0;
  const balance = grandTotal - paid;

  async function handleAddSupplier() {
    if (!newSupplierName.trim()) return;
    const created = await createSupplier(newSupplierName, newSupplierPhone);
    setSuppliers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setSupplierId(created.id);
    setShowAddSupplier(false);
    setNewSupplierName("");
    setNewSupplierPhone("");
  }

  function handleSubmit() {
    setError("");
    if (!supplierId) {
      setError("Supplier select කරන්න");
      return;
    }
    const validItems = lineItems.filter((li) => li.weight > 0);
    if (validItems.length === 0) {
      setError("අඩුම තරමින් item එකක් KG එක්ක දාන්න");
      return;
    }
    startTransition(async () => {
      try {
        await createLoadAndRedirect({
          supplier_id: supplierId,
          load_date: loadDate,
          paid_amount: paid,
          notes,
          items: validItems.map((li) => ({
            item_id: li.item_id,
            weight: li.weight,
            rate: li.rate,
          })),
        });
      } catch (e: any) {
        setError(e.message || "Save වෙන්නේ නැහැ, try again");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Step 1: Supplier */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <StepHeading n={1} title="ගෙනාපු කෙනා (Supplier)" />

        {!showAddSupplier ? (
          <>
            <input
              type="text"
              placeholder="Search supplier..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="mb-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
            />
            <div className="max-h-44 space-y-1 overflow-y-auto">
              {filteredSuppliers.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSupplierId(s.id)}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm ${
                    supplierId === s.id
                      ? "bg-amber-500 font-bold text-slate-950"
                      : "bg-slate-950 text-slate-200"
                  }`}
                >
                  {s.name} {s.phone ? `· ${s.phone}` : ""}
                </button>
              ))}
              {filteredSuppliers.length === 0 && (
                <p className="px-2 py-3 text-sm text-slate-500">No match found.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowAddSupplier(true)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 py-2.5 text-sm font-semibold text-amber-400"
            >
              <PlusIcon size={16} /> Add new supplier
            </button>
          </>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Supplier name"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={newSupplierPhone}
              onChange={(e) => setNewSupplierPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddSupplier}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950"
              >
                Save supplier
              </button>
              <button
                type="button"
                onClick={() => setShowAddSupplier(false)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {selectedSupplier && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckIcon size={15} /> Selected: {selectedSupplier.name}
          </p>
        )}
      </section>

      {/* Step 2 + 3: Items and weights */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <StepHeading n={2} title="Items & KG දාන්න" />
        <div className="mb-3 flex flex-wrap gap-2">
          {items.map((item) => {
            const isOn = !!selected[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  isOn ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    isOn ? "border-slate-950 bg-slate-950 text-amber-400" : "border-slate-500"
                  }`}
                >
                  {isOn && <CheckIcon size={11} strokeWidth={3} />}
                </span>
                {item.name}
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {lineItems.map((li) => (
            <div key={li.item_id} className="rounded-xl bg-slate-950/60 p-3">
              <p className="mb-2 text-sm font-bold text-slate-100">{li.name}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="KG"
                  value={selected[li.item_id].weight}
                  onChange={(e) => updateField(li.item_id, "weight", e.target.value)}
                  className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base focus:border-amber-500 focus:outline-none"
                />
                <span className="text-slate-500">kg ×</span>
                <span className="text-slate-500">Rs.</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={selected[li.item_id].rate}
                  onChange={(e) => updateField(li.item_id, "rate", e.target.value)}
                  className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="mt-2 text-right text-sm font-mono font-bold text-emerald-400">
                Subtotal: {formatRs(li.subtotal)}
              </p>
            </div>
          ))}
          {lineItems.length === 0 && (
            <p className="text-sm text-slate-500">Items select කරන්න uda ඉඳන්.</p>
          )}
        </div>
      </section>

      {/* Step 4: Grand total */}
      {lineItems.length > 0 && (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-200">Load Grand Total</span>
            <span className="font-mono text-xl font-extrabold text-amber-300">{formatRs(grandTotal)}</span>
          </div>
        </section>
      )}

      {/* Step 5: Payment */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <StepHeading n={3} title="Payment" />
        <label className="mb-1 block text-xs text-slate-400">Load date</label>
        <input
          type="date"
          value={loadDate}
          onChange={(e) => setLoadDate(e.target.value)}
          className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
        />
        <label className="mb-1 block text-xs text-slate-400">Paid amount (Rs.)</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
        />

        {lineItems.length > 0 && (
          <div className="mt-3 space-y-1 rounded-xl bg-slate-950/60 p-3 text-sm">
            <Row label="Total" value={formatRs(grandTotal)} />
            <Row label="Paid" value={formatRs(paid)} />
            <Row
              label="Balance"
              value={formatRs(balance)}
              bold
              tone={balance > 0 ? "warn" : "good"}
            />
          </div>
        )}

        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
          rows={2}
        />
      </section>

      {error && (
        <p className="rounded-xl bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Step 6: Save */}
      <PrimaryButton onClick={handleSubmit} disabled={isPending}>
        {isPending ? (
          "Saving..."
        ) : (
          <>
            <CheckIcon size={20} strokeWidth={3} />
            Save Load & Generate Bill
          </>
        )}
      </PrimaryButton>
    </div>
  );
}

function StepHeading({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-400">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 font-mono text-xs text-amber-400">
        {n}
      </span>
      {title}
    </h2>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "good" | "warn";
}) {
  const color = tone === "good" ? "text-emerald-400" : tone === "warn" ? "text-amber-400" : "text-slate-200";
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`font-mono ${bold ? "font-bold" : ""} ${color}`}>{value}</span>
    </div>
  );
}
