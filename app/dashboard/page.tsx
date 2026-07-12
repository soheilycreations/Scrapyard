import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ReadoutCard from "@/components/ReadoutCard";
import PrimaryButton from "@/components/PrimaryButton";
import { GearIcon, TruckIcon, LedgerIcon, StockIcon, CalendarIcon, CashIcon, FactoryIcon } from "@/components/icons";
import { getDailyReport } from "@/lib/actions/reports";
import { getRecentLoads } from "@/lib/actions/loads";
import { getRecentSales } from "@/lib/actions/sales";
import { getStock } from "@/lib/actions/stock";
import { createClient } from "@/lib/supabase/server";
import { formatRs, formatKg, todayISO, formatDateDisplay } from "@/lib/format";

export const dynamic = "force-dynamic";

function getGreeting() {
  // Sri Lanka is fixed UTC+5:30, no DST - safe to hardcode the offset
  const slTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const hour = slTime.getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(email: string | undefined) {
  if (!email) return "Owner";
  const namePart = email.split("@")[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

export default async function DashboardPage() {
  const today = todayISO();
  const supabase = await createClient();
  const [dailyReport, recentLoads, recentSales, stock, userRes] = await Promise.all([
    getDailyReport(today),
    getRecentLoads(5),
    getRecentSales(5),
    getStock(),
    supabase.auth.getUser(),
  ]);

  const topStock = stock.slice(0, 4);
  const greeting = getGreeting();
  const displayName = getDisplayName(userRes.data.user?.email);

  return (
    <>
      <PageHeader
        title="ScrapYard"
        subtitle={formatDateDisplay(today)}
        showLogo
        rightSlot={
          <div className="text-right">
            <p className="text-[10px] text-slate-500">{greeting} 👋</p>
            <p className="text-sm font-bold text-amber-400">{displayName}</p>
          </div>
        }
      />

      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-5">
        {/* Big primary CTA */}
        <Link href="/loads/new" className="block">
          <PrimaryButton>
            <TruckIcon size={22} />
            Load Add කරන්න
          </PrimaryButton>
        </Link>

        {/* Quick access grid */}
        <section className="grid grid-cols-3 gap-2">
          <QuickLink href="/suppliers" Icon={LedgerIcon} label="Suppliers" />
          <QuickLink href="/stock" Icon={StockIcon} label="Stock" />
          <QuickLink href="/sales" Icon={FactoryIcon} label="Sell Stock" />
          <QuickLink href="/expenses" Icon={CashIcon} label="Expenses" />
          <QuickLink href="/reports" Icon={CalendarIcon} label="Reports" />
          <QuickLink href="/settings" Icon={GearIcon} label="Settings" />
        </section>

        {/* Today summary */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-bold text-slate-400">
            Today ({dailyReport.loads.length} loads)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ReadoutCard label="Total KG" value={formatKg(dailyReport.totalKg)} />
            <ReadoutCard label="Total Amount" value={formatRs(dailyReport.totalAmount)} />
            <ReadoutCard label="Paid" value={formatRs(dailyReport.totalPaid)} tone="good" />
            <ReadoutCard label="Balance" value={formatRs(dailyReport.totalBalance)} tone="warn" />
          </div>
        </section>

        {/* Stock snapshot */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400">Stock inside yard</h2>
            <Link href="/stock" className="text-xs font-semibold text-amber-400">
              View all →
            </Link>
          </div>
          {topStock.length === 0 ? (
            <EmptyRow text="No stock yet - add your first load." />
          ) : (
            <div className="space-y-2">
              {topStock.map((s: any) => (
                <div key={s.item_id} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{s.items?.name}</span>
                  <span className="font-mono text-sm font-bold tabular-nums text-slate-100">
                    {formatKg(s.total_weight)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent loads */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400">Recent loads</h2>
            <Link href="/reports" className="text-xs font-semibold text-amber-400">
              Reports →
            </Link>
          </div>
          {recentLoads.length === 0 ? (
            <EmptyRow text="No loads recorded yet." />
          ) : (
            <div className="divide-y divide-slate-800">
              {recentLoads.map((l: any) => (
                <Link
                  key={l.id}
                  href={`/loads/${l.id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-slate-800/30 -mx-1 px-1 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      #{l.load_number} · {l.suppliers?.name}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateDisplay(l.load_date)}</p>
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

        {/* Recent sales */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400">Recent sales (to factory)</h2>
            <Link href="/sales" className="text-xs font-semibold text-amber-400">
              View all →
            </Link>
          </div>
          {recentSales.length === 0 ? (
            <EmptyRow text="No sales yet - sell stock once you've collected enough." />
          ) : (
            <div className="divide-y divide-slate-800">
              {recentSales.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/sales/${s.id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-slate-800/30 -mx-1 px-1 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      #{s.sale_number} · {s.buyer_name}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateDisplay(s.sale_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold tabular-nums text-slate-100">
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

function QuickLink({
  href,
  Icon,
  label,
}: {
  href: string;
  Icon: (props: { size?: number }) => React.ReactElement;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 rounded-2xl border border-slate-800 bg-slate-900 py-2.5 text-slate-300 transition active:scale-95 hover:border-slate-700"
    >
      <Icon size={20} />
      <span className="text-[10px] font-semibold text-slate-400">{label}</span>
    </Link>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="py-2 text-sm text-slate-500">{text}</p>;
}
