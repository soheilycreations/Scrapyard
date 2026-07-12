"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type SaleItemInput = {
  item_id: string;
  weight: number;
  rate: number;
};

/**
 * Records a sale (stock going OUT to a buyer/factory). Stock levels,
 * the sale's total_amount, and profit-per-item are all computed by
 * database triggers (see supabase/schema.sql) - this function never
 * calculates money itself, and the DB will reject the sale if it
 * would oversell available stock.
 */
export async function createSale(input: {
  buyer_name: string;
  buyer_phone?: string;
  sale_date: string;
  notes?: string;
  items: SaleItemInput[];
}) {
  const supabase = await createClient();

  if (!input.buyer_name.trim()) throw new Error("Buyer name is required");
  if (!input.items.length) throw new Error("Add at least one item to sell");

  const { data: sale, error: saleErr } = await supabase
    .from("sales")
    .insert({
      buyer_name: input.buyer_name.trim(),
      buyer_phone: input.buyer_phone?.trim() || null,
      sale_date: input.sale_date,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (saleErr) throw new Error(saleErr.message);

  const rows = input.items.map((it) => ({
    sale_id: sale.id,
    item_id: it.item_id,
    weight: it.weight,
    rate: it.rate,
    subtotal: 0, // computed by trigger
  }));

  const { error: itemsErr } = await supabase.from("sale_items").insert(rows);
  if (itemsErr) {
    // roll back the empty sale header if items failed (e.g. insufficient stock)
    await supabase.from("sales").delete().eq("id", sale.id);
    throw new Error(itemsErr.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/stock");
  revalidatePath("/reports");
  revalidatePath("/sales");

  return sale.id as string;
}

export async function createSaleAndRedirect(input: {
  buyer_name: string;
  buyer_phone?: string;
  sale_date: string;
  notes?: string;
  items: SaleItemInput[];
}) {
  const saleId = await createSale(input);
  redirect(`/sales/${saleId}`);
}

export async function getSale(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*, items(*))")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getRecentSales(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllSales() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Edits an existing sale. Item rows are replaced wholesale (delete then
 * re-insert) rather than diffed - this keeps the logic simple and correct:
 * deleting old sale_items restores stock via the DB trigger, then
 * inserting the new ones draws from that refreshed stock level, so you
 * still can't accidentally oversell while editing.
 * Note: cost_rate for edited items is re-snapshotted at edit time (the
 * average cost may have moved since the original sale).
 */
export async function updateSale(
  saleId: string,
  input: {
    buyer_name: string;
    buyer_phone?: string;
    sale_date: string;
    notes?: string;
    items: SaleItemInput[];
  }
) {
  const supabase = await createClient();

  if (!input.buyer_name.trim()) throw new Error("Buyer name is required");
  if (!input.items.length) throw new Error("Add at least one item to sell");

  const { error: headerErr } = await supabase
    .from("sales")
    .update({
      buyer_name: input.buyer_name.trim(),
      buyer_phone: input.buyer_phone?.trim() || null,
      sale_date: input.sale_date,
      notes: input.notes || null,
    })
    .eq("id", saleId);
  if (headerErr) throw new Error(headerErr.message);

  const { error: delErr } = await supabase.from("sale_items").delete().eq("sale_id", saleId);
  if (delErr) throw new Error(delErr.message);

  const rows = input.items.map((it) => ({
    sale_id: saleId,
    item_id: it.item_id,
    weight: it.weight,
    rate: it.rate,
    subtotal: 0,
  }));
  const { error: insErr } = await supabase.from("sale_items").insert(rows);
  if (insErr) throw new Error(insErr.message);

  revalidatePath(`/sales/${saleId}`);
  revalidatePath("/sales");
  revalidatePath("/stock");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}

export async function deleteSale(saleId: string) {
  const supabase = await createClient();
  // sale_items cascade-delete, which restores stock via the same
  // per-row trigger used for normal edits/deletes.
  const { error } = await supabase.from("sales").delete().eq("id", saleId);
  if (error) throw new Error(error.message);
  revalidatePath("/sales");
  revalidatePath("/stock");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}

export async function getSalesInRange(start: string, end: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*, items(name))")
    .gte("sale_date", start)
    .lte("sale_date", end)
    .order("sale_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
