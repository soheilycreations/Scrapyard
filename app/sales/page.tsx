import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ReadoutCard from "@/components/ReadoutCard";
import { getAllSales } from "@/lib/actions/sales";
import { formatRs, formatDateDisplay } from "@/lib/format";
import { PlusIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await getAllSales();

  const totalSales = sales.reduce((s: number, x: any) => s + Number(x.total_amount), 0);
  const totalProfit = sales.reduce((s: number, x: any) => s + Number(x.total_profit), 0);

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="Stock sold to factory/buyer"
        back
        action={{ label: "+ New", href: "/sales/new" }}
      />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-4">
        <section className="grid grid-cols-2 gap-3">
          <ReadoutCard label="Total sales" value={formatRs(totalSales)} tone="good" />
          <ReadoutCard label="Total profit" value={formatRs(totalProfit)} tone={totalProfit >= 0 ? "good" : "warn"} />
        </section>

        {sales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center">
            <p className="mb-3 text-sm text-slate-500">No sales recorded yet.</p>
            <Link
              href="/sales/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950"
            >
              <PlusIcon size={16} /> Sell stock
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sales.map((s: any) => (
              <Link
                key={s.id}
                href={`/sales/${s.id}`}
                className="block rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold text-slate-100">
                      #{s.sale_number} · {s.buyer_name}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateDisplay(s.sale_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-base font-extrabold tabular-nums text-slate-100">
                      {formatRs(s.total_amount)}
                    </p>
                    <p
                      className={`text-xs font-semibold ${
                        Number(s.total_profit) >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      Profit {formatRs(s.total_profit)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
