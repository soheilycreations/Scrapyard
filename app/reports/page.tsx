import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ReadoutCard from "@/components/ReadoutCard";
import { getDailyReport, getMonthlyReport } from "@/lib/actions/reports";
import { formatRs, formatKg, todayISO, formatDateDisplay } from "@/lib/format";
import ReportControls from "./ReportControls";

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; date?: string; year?: string; month?: string }>;
}) {
  const sp = await searchParams;
  const mode = sp.mode === "monthly" ? "monthly" : "daily";
  const date = sp.date || todayISO();
  const now = new Date();
  const year = Number(sp.year) || now.getFullYear();
  const month = Number(sp.month) || now.getMonth() + 1;

  const daily = mode === "daily" ? await getDailyReport(date) : null;
  const monthly = mode === "monthly" ? await getMonthlyReport(year, month) : null;

  return (
    <>
      <PageHeader title="Reports" subtitle="Date-wise view" back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-4">
        <ReportControls mode={mode} date={date} year={year} month={month} />

        {mode === "daily" && daily && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 grid grid-cols-2 gap-3">
              <ReadoutCard label="Loads" value={String(daily.loads.length)} />
              <ReadoutCard label="Total KG" value={formatKg(daily.totalKg)} />
              <ReadoutCard label="Purchases" value={formatRs(daily.totalAmount)} />
              <ReadoutCard label="Balance owed" value={formatRs(daily.totalBalance)} tone="warn" />
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 grid grid-cols-2 gap-3">
              <ReadoutCard label="Sales" value={formatRs(daily.totalSales)} tone="good" />
              <ReadoutCard label="Profit" value={formatRs(daily.totalProfit)} tone={daily.totalProfit >= 0 ? "good" : "warn"} />
              <ReadoutCard label="Expenses" value={formatRs(daily.totalExpenses)} tone="warn" />
              <ReadoutCard
                label="Net cash"
                value={formatRs(daily.totalSales - daily.totalPaid - daily.totalExpenses)}
              />
            </section>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-3 text-sm font-bold text-slate-400">
                Loads on {formatDateDisplay(date)}
              </h2>
              {daily.loads.length === 0 ? (
                <p className="text-sm text-slate-500">No loads on this date.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {daily.loads.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          #{l.load_number} · {l.suppliers?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {l.load_items
                            ?.map((li: any) => `${li.items?.name} ${formatKg(li.weight)}`)
                            .join(", ")}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-bold tabular-nums text-slate-100">
                        {formatRs(l.total_amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {mode === "monthly" && monthly && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 grid grid-cols-2 gap-3">
              <ReadoutCard label="Loads" value={String(monthly.totalLoads)} />
              <ReadoutCard label="Total spent" value={formatRs(monthly.totalAmount)} />
              <ReadoutCard label="Total paid" value={formatRs(monthly.totalPaid)} tone="good" />
              <ReadoutCard label="Outstanding" value={formatRs(monthly.totalBalance)} tone="warn" />
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 grid grid-cols-2 gap-3">
              <ReadoutCard label="Sales" value={formatRs(monthly.totalSales)} tone="good" />
              <ReadoutCard label="Profit" value={formatRs(monthly.totalProfit)} tone={monthly.totalProfit >= 0 ? "good" : "warn"} />
              <ReadoutCard label="Expenses" value={formatRs(monthly.totalExpenses)} tone="warn" />
              <ReadoutCard label="Net cash" value={formatRs(monthly.netCash)} />
            </section>

            {Object.keys(monthly.expensesByCategory).length > 0 && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <h2 className="mb-3 text-sm font-bold text-slate-400">Expenses by category</h2>
                <div className="space-y-1.5">
                  {Object.entries(monthly.expensesByCategory)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([cat, amt]) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span className="text-slate-300">{cat}</span>
                        <span className="font-mono font-semibold tabular-nums text-amber-400">
                          {formatRs(amt as number)}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-3 text-sm font-bold text-slate-400">Stock added this month</h2>
              {Object.entries(monthly.stockAddedByItem).length === 0 ? (
                <p className="text-sm text-slate-500">No stock added.</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(monthly.stockAddedByItem).map(([name, kg]) => (
                    <div key={name} className="flex justify-between text-sm">
                      <span className="text-slate-300">{name}</span>
                      <span className="font-mono font-semibold tabular-nums text-slate-100">{formatKg(kg as number)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="mb-3 text-sm font-bold text-slate-400">Outstanding by supplier</h2>
              {Object.entries(monthly.outstandingBySupplier).filter(([, v]) => (v as number) > 0)
                .length === 0 ? (
                <p className="text-sm text-slate-500">No outstanding balances 🎉</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(monthly.outstandingBySupplier)
                    .filter(([, v]) => (v as number) > 0)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([name, bal]) => (
                      <div key={name} className="flex justify-between text-sm">
                        <span className="text-slate-300">{name}</span>
                        <span className="font-mono font-semibold tabular-nums text-amber-400">{formatRs(bal as number)}</span>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}
