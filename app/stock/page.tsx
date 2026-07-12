import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getStock } from "@/lib/actions/stock";
import { formatKg, formatRs } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const stock = await getStock();
  const totalKg = stock.reduce((s: number, r: any) => s + Number(r.total_weight), 0);
  const totalValue = stock.reduce(
    (s: number, r: any) => s + Number(r.total_weight) * Number(r.avg_cost_rate || 0),
    0
  );

  return (
    <>
      <PageHeader title="Stock" subtitle="Live yard stock - auto-updated" back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="text-xs text-amber-200">Total stock in yard</p>
            <p className="font-mono text-2xl font-extrabold text-amber-300">{formatKg(totalKg)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-500">Est. cost value</p>
            <p className="font-mono text-2xl font-extrabold text-slate-100">{formatRs(totalValue)}</p>
          </div>
        </div>

        {stock.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No stock yet - it fills up automatically as loads are saved.
          </p>
        )}

        <div className="space-y-2">
          {stock.map((s: any) => (
            <div
              key={s.item_id}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <div>
                <p className="text-base font-bold text-slate-100">{s.items?.name}</p>
                <p className="text-xs text-slate-500">
                  Avg cost: {formatRs(s.avg_cost_rate || 0)}/kg
                  {!s.items?.active && " · (item disabled in settings)"}
                </p>
              </div>
              <p className="font-mono text-lg font-extrabold tabular-nums text-slate-100">
                {formatKg(s.total_weight)}
              </p>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
