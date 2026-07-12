import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import ReadoutCard from "@/components/ReadoutCard";
import { getRecentExpenses } from "@/lib/actions/expenses";
import { formatRs, todayISO } from "@/lib/format";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await getRecentExpenses(50);

  const thisMonth = todayISO().slice(0, 7);
  const monthTotal = expenses
    .filter((e: any) => e.expense_date.slice(0, 7) === thisMonth)
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  return (
    <>
      <PageHeader title="Expenses" subtitle="Business cash out - wages, transport, rent etc." back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="grid grid-cols-2 gap-3">
            <ReadoutCard label="This month" value={formatRs(monthTotal)} tone="warn" />
            <ReadoutCard label="Total entries" value={String(expenses.length)} />
          </div>
        </section>

        <ExpenseForm />
        <ExpenseList expenses={expenses} />
      </main>
      <BottomNav />
    </>
  );
}
