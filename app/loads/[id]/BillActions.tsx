"use client";

import { formatRs, formatKg, formatDateDisplay } from "@/lib/format";
import { PrintIcon, ShareIcon } from "@/components/icons";

export default function BillActions({ load }: { load: any }) {
  function handlePrint() {
    window.print();
  }

  function handleWhatsAppShare() {
    const lines = [
      `*ScrapYard - Load #${load.load_number}*`,
      `Date: ${formatDateDisplay(load.load_date)}`,
      `Supplier: ${load.suppliers?.name}`,
      "",
      ...load.load_items.map(
        (li: any) =>
          `${li.items?.name}: ${formatKg(li.weight)} × ${formatRs(li.rate)} = ${formatRs(li.subtotal)}`
      ),
      "",
      `Total: ${formatRs(load.total_amount)}`,
      `Paid: ${formatRs(load.paid_amount)}`,
      `Balance: ${formatRs(load.balance)}`,
    ];
    const text = encodeURIComponent(lines.join("\n"));
    const phone = (load.suppliers?.phone || "").replace(/[^0-9]/g, "");
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  return (
    <div className="flex gap-2 print:hidden">
      <button
        onClick={handlePrint}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-bold text-slate-200 transition active:scale-[0.98] hover:border-slate-600"
      >
        <PrintIcon size={18} /> Print Bill
      </button>
      <button
        onClick={handleWhatsAppShare}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition active:scale-[0.98] hover:bg-emerald-500"
      >
        <ShareIcon size={18} /> WhatsApp Share
      </button>
    </div>
  );
}
