import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ReadoutCard from "@/components/ReadoutCard";
import { getSupplierLedger } from "@/lib/actions/suppliers";
import { formatRs, formatDateDisplay } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SupplierLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supplier, loads, summary } = await getSupplierLedger(id);

  return (
    <>
      <PageHeader title={supplier.name} subtitle={supplier.phone || "Supplier ledger"} back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid grid-cols-2 gap-3">
            <ReadoutCard label="Total loads" value={String(summary.totalLoads)} />
            <ReadoutCard label="Total amount" value={formatRs(summary.totalAmount)} />
            <ReadoutCard label="Total paid" value={formatRs(summary.totalPaid)} tone="good" />
            <ReadoutCard label="Balance due" value={formatRs(summary.totalBalance)} tone="warn" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-400">Transaction history</h2>
          {loads.length === 0 ? (
            <p className="text-sm text-slate-500">No loads yet from this supplier.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {loads.map((l: any) => (
                <Link
                  key={l.id}
                  href={`/loads/${l.id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-slate-800/30 -mx-1 px-1 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {formatDateDisplay(l.load_date)} · Load #{l.load_number}
                    </p>
                    <p className="text-xs text-slate-500">
                      Paid {formatRs(l.paid_amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold tabular-nums text-slate-100">
                      {formatRs(l.total_amount)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        Number(l.balance) > 0 ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {Number(l.balance) > 0 ? `Bal ${formatRs(l.balance)}` : "Fully paid"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}
