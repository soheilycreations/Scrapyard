"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStock() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock")
    .select("*, items(name, active)")
    .order("total_weight", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getStockMovements(itemId: string, days = 30) {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("item_id", itemId)
    .gte("movement_date", since.toISOString().slice(0, 10))
    .order("movement_date", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}
