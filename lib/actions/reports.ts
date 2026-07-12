"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDailyReport(date: string) {
  const supabase = await createClient();

  const [loadsRes, salesRes, expensesRes] = await Promise.all([
    supabase
      .from("loads")
      .select("*, suppliers(name), load_items(*, items(name))")
      .eq("load_date", date)
      .order("created_at", { ascending: false }),
    supabase
      .from("sales")
      .select("*, sale_items(*, items(name))")
      .eq("sale_date", date)
      .order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").eq("expense_date", date),
  ]);

  if (loadsRes.error) throw new Error(loadsRes.error.message);
  if (salesRes.error) throw new Error(salesRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);

  const loads = loadsRes.data ?? [];
  const sales = salesRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const totalAmount = loads.reduce((s, l) => s + Number(l.total_amount), 0);
  const totalPaid = loads.reduce((s, l) => s + Number(l.paid_amount), 0);
  const totalBalance = loads.reduce((s, l) => s + Number(l.balance), 0);
  const totalKg = loads.reduce(
    (s, l) => s + (l.load_items ?? []).reduce((s2: number, li: any) => s2 + Number(li.weight), 0),
    0
  );

  const totalSales = sales.reduce((s: number, x: any) => s + Number(x.total_amount), 0);
  const totalProfit = sales.reduce((s: number, x: any) => s + Number(x.total_profit), 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);

  return {
    loads,
    sales,
    expenses,
    totalAmount,
    totalPaid,
    totalBalance,
    totalKg,
    totalSales,
    totalProfit,
    totalExpenses,
  };
}

export async function getMonthlyReport(year: number, month: number) {
  const supabase = await createClient();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(endDate).padStart(2, "0")}`;

  const [loadsRes, salesRes, expensesRes] = await Promise.all([
    supabase
      .from("loads")
      .select("*, suppliers(name), load_items(*, items(name))")
      .gte("load_date", start)
      .lte("load_date", end)
      .order("load_date", { ascending: false }),
    supabase
      .from("sales")
      .select("*, sale_items(*, items(name))")
      .gte("sale_date", start)
      .lte("sale_date", end)
      .order("sale_date", { ascending: false }),
    supabase.from("expenses").select("*").gte("expense_date", start).lte("expense_date", end),
  ]);

  if (loadsRes.error) throw new Error(loadsRes.error.message);
  if (salesRes.error) throw new Error(salesRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);

  const loads = loadsRes.data ?? [];
  const sales = salesRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const totalAmount = loads.reduce((s, l) => s + Number(l.total_amount), 0);
  const totalPaid = loads.reduce((s, l) => s + Number(l.paid_amount), 0);
  const totalBalance = loads.reduce((s, l) => s + Number(l.balance), 0);

  const stockAddedByItem: Record<string, number> = {};
  for (const l of loads) {
    for (const li of l.load_items ?? []) {
      const name = (li as any).items?.name ?? "Unknown";
      stockAddedByItem[name] = (stockAddedByItem[name] || 0) + Number(li.weight);
    }
  }

  const outstandingBySupplier: Record<string, number> = {};
  for (const l of loads) {
    const name = (l as any).suppliers?.name ?? "Unknown";
    outstandingBySupplier[name] = (outstandingBySupplier[name] || 0) + Number(l.balance);
  }

  const totalSales = sales.reduce((s: number, x: any) => s + Number(x.total_amount), 0);
  const totalProfit = sales.reduce((s: number, x: any) => s + Number(x.total_profit), 0);
  const totalExpenses = expenses.reduce((s: number, e: any) => s + Number(e.amount), 0);
  const netCash = totalPaid > 0 ? totalSales - totalPaid - totalExpenses : totalSales - totalExpenses;

  const expensesByCategory: Record<string, number> = {};
  for (const e of expenses) {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + Number(e.amount);
  }

  return {
    loads,
    sales,
    expenses,
    totalAmount,
    totalPaid,
    totalBalance,
    stockAddedByItem,
    outstandingBySupplier,
    totalLoads: loads.length,
    totalSales,
    totalProfit,
    totalExpenses,
    expensesByCategory,
    netCash,
  };
}
