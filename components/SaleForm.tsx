"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSaleAndRedirect, updateSale } from "@/lib/actions/sales";
import { formatRs, formatKg, todayISO } from "@/lib/format";
import PrimaryButton from "@/components/PrimaryButton";
import { CheckIcon } from "@/components/icons";

type StockRow = {
  item_id: string;
  total_weight: number;
  avg_cost_rate: number;
  items?: { name: string };
};

type SelectedItem = {
  item_id: string;
  name: string;
  available: number;
  avgCost: number;
  weight: string;
  rate: string;
};

type InitialSale = {
  buyer_name: string;
  buyer_phone: string | null;
  sale_date: string;
  notes: string | null;
  items: { item_id: string; name: string; weight: number; rate: number }[];
};

export default function SaleForm({
  stock,
  saleId,
  initial,
  onCancel,
}: {
  stock: StockRow[];
  saleId?: string;
  initial?: InitialSale;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const isEdit = !!saleId;

  const stockByItemId = new Map(stock.map((s) => [s.item_id, s]));

  function buildInitialSelected(): Record<string, SelectedItem> {
    if (!initial) return {};
    const map: Record<string, SelectedItem> = {};
    for (const it of initial.items) {
      const s = stockByItemId.get(it.item_id);
      // when editing, the weight already allocated to THIS sale is still
      // "available" to re-enter, since it'll be restored before re-saving
      const available = (s ? Number(s.total_weight) : 0) + it.weight;
      map[it.item_id] = {
        item_id: it.item_id,
        name: it.name,
        available,
        avgCost: s ? Number(s.avg_cost_rate) : 0,
        weight: String(it.weight),
        rate: String(it.rate),
      };
    }
    return map;
  }

  const [selected, setSelected] = useState<Record<string, SelectedItem>>(buildInitialSelected());
  const [buyerName, setBuyerName] = useState(initial?.buyer_name || "");
  const [buyerPhone, setBuyerPhone] = useState(initial?.buyer_phone || "");
  const [saleDate, setSaleDate] = useState(initial?.sale_date || todayISO());
  const [notes, setNotes] = useState(initial?.notes || "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleItem(s: StockRow) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[s.item_id]) {
        delete next[s.item_id];
      } else {
        next[s.item_id] = {
          item_id: s.item_id,
          name: s.items?.name || "Item",
          available: Number(s.total_weight),
          avgCost: Number(s.avg_cost_rate),
          weight: "",
          rate: "",
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
    const subtotal = weight * rate;
    const profit = subtotal - weight * s.avgCost;
    return { ...s, weight, rate, subtotal, profit };
  });

  const grandTotal = lineItems.reduce((sum, li) => sum + li.subtotal, 0);
  const grandProfit = lineItems.reduce((sum, li) => sum + li.profit, 0);

  function handleSubmit() {
    setError("");
    if (!buyerName.trim()) {
      setError("Buyer/Factory name එකක් දාන්න");
      return;
    }
    const validItems = lineItems.filter((li) => li.weight > 0);
    if (validItems.length === 0) {
      setError("අඩුම තරමින් item එකක් KG එක්ක දාන්න");
      return;
    }
    for (const li of validItems) {
      if (li.weight > li.available) {
        setError(`${li.name}: ${formatKg(li.available)} විතරයි තියෙන්නේ`);
        return;
      }
      if (!li.rate || li.rate <= 0) {
        setError(`${li.name}: sell rate එකක් දාන්න`);
        return;
      }
    }
    startTransition(async () => {
      try {
        const payload = {
          buyer_name: buyerName,
          buyer_phone: buyerPhone,
          sale_date: saleDate,
          notes,
          items: validItems.map((li) => ({
            item_id: li.item_id,
            weight: li.weight,
            rate: li.rate,
          })),
        };
        if (isEdit) {
          await updateSale(saleId!, payload);
          router.push(`/sales/${saleId}`);
          router.refresh();
        } else {
          await createSaleAndRedirect(payload);
        }
      } catch (e: any) {
        setError(e.message || "Save වෙන්නේ නැහැ, try again");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Buyer */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-sm font-bold text-amber-400">Buyer / Factory</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Buyer/Factory name"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
          />
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base focus:border-amber-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Items from stock */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-sm font-bold text-amber-400">Items to sell</h2>

        {stock.length === 0 ? (
          <p className="text-sm text-slate-500">No stock available to sell right now.</p>
        ) : (
          <div className="mb-3 flex flex-wrap gap-2">
            {stock.map((s) => {
              const isOn = !!selected[s.item_id];
              return (
                <button
                  key={s.item_id}
                  type="button"
                  onClick={() => toggleItem(s)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    isOn ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {s.items?.name} · {formatKg(s.total_weight)}
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {lineItems.map((li) => (
            <div key={li.item_id} className="rounded-xl bg-slate-950/60 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-100">{li.name}</p>
                <p className="text-xs text-slate-500">
                  Available: {formatKg(li.available)} · Cost: {formatRs(li.avgCost)}/kg
                </p>
              </div>
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
                  placeholder="Sell rate"
                  value={selected[li.item_id].rate}
                  onChange={(e) => updateField(li.item_id, "rate", e.target.value)}
                  className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base focus:border-amber-500 focus:outline-none"
                />
              </div>
              {li.weight > 0 && li.rate > 0 && (
                <div className="mt-2 flex justify-between text-sm">
                  <span className="font-mono font-bold text-slate-200">
                    Subtotal: {formatRs(li.subtotal)}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      li.profit >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    Profit: {formatRs(li.profit)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Grand total + profit */}
      {lineItems.length > 0 && (
        <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-200">Sale Total</span>
            <span className="font-mono text-xl font-extrabold text-amber-300">
              {formatRs(grandTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-300">Expected Profit</span>
            <span
              className={`font-mono text-lg font-extrabold ${
                grandProfit >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatRs(grandProfit)}
            </span>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <label className="mb-1 block text-xs text-slate-400">Notes (optional)</label>
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
          rows={2}
        />
      </section>

      {error && (
        <p className="rounded-xl bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <PrimaryButton onClick={handleSubmit} disabled={isPending}>
            <CheckIcon size={20} strokeWidth={3} />
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Save Sale"}
          </PrimaryButton>
        </div>
        {isEdit && onCancel && (
          <button
            onClick={onCancel}
            className="rounded-2xl border border-slate-700 px-5 text-sm font-semibold text-slate-300"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
