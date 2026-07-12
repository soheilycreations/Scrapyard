import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/server";
import { formatRs } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const supabase = await createClient();

  // Pull suppliers with aggregated balances in one query
  const { data: suppliers, error } = await supabase
    .from("suppliers")
    .select("*, loads(total_amount, paid_amount, balance)")
    .order("name");

  if (error) throw new Error(error.message);

  const rows = (suppliers ?? []).map((s: any) => {
    const totalAmount = s.loads.reduce((sum: number, l: any) => sum + Number(l.total_amount), 0);
    const totalPaid = s.loads.reduce((sum: number, l: any) => sum + Number(l.paid_amount), 0);
    const totalBalance = s.loads.reduce((sum: number, l: any) => sum + Number(l.balance), 0);
    return {
      id: s.id,
      name: s.name,
      phone: s.phone,
      loadCount: s.loads.length,
      totalAmount,
      totalPaid,
      totalBalance,
    };
  });

  const sorted = rows.sort((a, b) => b.totalBalance - a.totalBalance);

  return (
    <>
      <PageHeader title="Suppliers" subtitle="Digital Potha - supplier balances" back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-3">
        {sorted.length === 0 && (
          <p className="mt-8 text-center text-sm text-slate-500">
            No suppliers yet. Add one from Load Add screen.
          </p>
        )}
        {sorted.map((s) => (
          <Link
            key={s.id}
            href={`/suppliers/${s.id}`}
            className="block rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-slate-100">{s.name}</p>
                <p className="text-xs text-slate-500">
                  {s.phone || "No phone"} · {s.loadCount} loads
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Balance</p>
                <p
                  className={`text-base font-extrabold ${
                    s.totalBalance > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {formatRs(s.totalBalance)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </main>
      <BottomNav />
    </>
  );
}
