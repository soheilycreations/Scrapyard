"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSale } from "@/lib/actions/sales";
import { formatRs, formatKg, formatDateDisplay } from "@/lib/format";
import { EditIcon, TrashIcon } from "@/components/icons";
import SaleForm from "@/components/SaleForm";
import SaleBillActions from "./SaleBillActions";

export default function SaleDetailClient({ sale, stock }: { sale: any; stock: any[] }) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deleteSale(sale.id);
      router.push("/sales");
    });
  }

  if (mode === "edit") {
    return (
      <SaleForm
        stock={stock}
        saleId={sale.id}
        initial={{
          buyer_name: sale.buyer_name,
          buyer_phone: sale.buyer_phone,
          sale_date: sale.sale_date,
          notes: sale.notes,
          items: (sale.sale_items ?? []).map((si: any) => ({
            item_id: si.item_id,
            name: si.items?.name || "Item",
            weight: Number(si.weight),
            rate: Number(si.rate),
          })),
        }}
        onCancel={() => setMode("view")}
      />
    );
  }

  return (
    <>
      <div id="bill-content" className="ticket-card rounded-2xl border border-slate-800 bg-slate-900 p-5 pt-7">
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-slate-700 pb-3">
          <div>
            <p className="text-xs text-slate-500">Sale Receipt</p>
            <p className="text-lg font-extrabold text-slate-50">Sale #{sale.sale_number}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Date</p>
            <p className="text-sm font-semibold text-slate-200">
              {formatDateDisplay(sale.sale_date)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-500">Buyer</p>
          <p className="text-base font-bold text-slate-100">{sale.buyer_name}</p>
          {sale.buyer_phone && <p className="text-sm text-slate-400">{sale.buyer_phone}</p>}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-500">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 font-medium text-right">KG</th>
              <th className="pb-2 font-medium text-right">Rate</th>
              <th className="pb-2 font-medium text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sale.sale_items?.map((si: any) => (
              <tr key={si.id}>
                <td className="py-2 text-slate-200">{si.items?.name}</td>
                <td className="py-2 text-right text-slate-300">{formatKg(si.weight)}</td>
                <td className="py-2 text-right text-slate-300">{formatRs(si.rate)}</td>
                <td className="py-2 text-right font-mono font-semibold text-slate-100">
                  {formatRs(si.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1.5 border-t border-dashed border-slate-700 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Sale Total</span>
            <span className="font-mono font-bold text-slate-100">{formatRs(sale.total_amount)}</span>
          </div>
          <div className="flex justify-between text-base print:hidden">
            <span className="font-bold text-slate-200">Profit</span>
            <span
              className={`font-mono font-extrabold ${
                Number(sale.total_profit) >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatRs(sale.total_profit)}
            </span>
          </div>
        </div>

        {sale.notes && (
          <p className="mt-3 rounded-lg bg-slate-950/60 p-2 text-xs text-slate-400">
            Note: {sale.notes}
          </p>
        )}
      </div>

      <SaleBillActions sale={sale} />

      {confirmDelete ? (
        <div className="rounded-2xl border border-red-900 bg-red-950/40 p-4">
          <p className="mb-3 text-sm text-red-300">
            Delete this sale? Stock will be restored back to the yard.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {isPending ? "Deleting..." : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setMode("edit")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-bold text-slate-200 transition active:scale-[0.98] hover:border-slate-600"
          >
            <EditIcon size={16} /> Edit sale
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-950 px-4 py-3 text-sm font-bold text-red-400"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      )}
    </>
  );
}
