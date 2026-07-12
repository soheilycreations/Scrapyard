import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getLoad } from "@/lib/actions/loads";
import { formatRs, formatKg, formatDateDisplay } from "@/lib/format";
import BillActions from "./BillActions";
import PaymentEditor from "./PaymentEditor";

export const dynamic = "force-dynamic";

export default async function LoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const load: any = await getLoad(id);

  return (
    <>
      <PageHeader title={`Load #${load.load_number}`} subtitle={formatDateDisplay(load.load_date)} back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-5">
        <div id="bill-content" className="ticket-card rounded-2xl border border-slate-800 bg-slate-900 p-5 pt-7">
          <div className="mb-4 flex items-center justify-between border-b border-dashed border-slate-700 pb-3">
            <div>
              <p className="text-xs text-slate-500">Bill / Load Slip</p>
              <p className="text-lg font-extrabold text-slate-50">
                Load #{load.load_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Date</p>
              <p className="text-sm font-semibold text-slate-200">
                {formatDateDisplay(load.load_date)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-500">Supplier</p>
            <p className="text-base font-bold text-slate-100">{load.suppliers?.name}</p>
            {load.suppliers?.phone && (
              <p className="text-sm text-slate-400">{load.suppliers.phone}</p>
            )}
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
              {load.load_items?.map((li: any) => (
                <tr key={li.id}>
                  <td className="py-2 text-slate-200">{li.items?.name}</td>
                  <td className="py-2 text-right text-slate-300">{formatKg(li.weight)}</td>
                  <td className="py-2 text-right text-slate-300">{formatRs(li.rate)}</td>
                  <td className="py-2 text-right font-mono font-semibold text-slate-100">
                    {formatRs(li.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1.5 border-t border-dashed border-slate-700 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total</span>
              <span className="font-mono font-bold text-slate-100">{formatRs(load.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Paid</span>
              <span className="font-mono font-semibold text-emerald-400">{formatRs(load.paid_amount)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-bold text-slate-200">Balance</span>
              <span
                className={`font-mono font-extrabold ${
                  Number(load.balance) > 0 ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {formatRs(load.balance)}
              </span>
            </div>
          </div>

          {load.notes && (
            <p className="mt-3 rounded-lg bg-slate-950/60 p-2 text-xs text-slate-400">
              Note: {load.notes}
            </p>
          )}
        </div>

        <BillActions load={load} />
        <PaymentEditor loadId={load.id} currentPaid={load.paid_amount} total={load.total_amount} />
      </main>
      <BottomNav />
    </>
  );
}
