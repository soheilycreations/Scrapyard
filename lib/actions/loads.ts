"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type LoadItemInput = {
  item_id: string;
  weight: number;
  rate: number;
};

/**
 * Create a full load in one shot: header row + all line items.
 * Stock and totals are kept correct automatically by DB triggers
 * (see supabase/schema.sql) - this function never calculates
 * totals or touches the stock table itself.
 */
export async function createLoad(input: {
  supplier_id: string;
  load_date: string;
  paid_amount: number;
  notes?: string;
  items: LoadItemInput[];
}) {
  const supabase = await createClient();

  if (!input.supplier_id) throw new Error("Supplier is required");
  if (!input.items.length) throw new Error("Add at least one item");

  const { data: load, error: loadErr } = await supabase
    .from("loads")
    .insert({
      supplier_id: input.supplier_id,
      load_date: input.load_date,
      paid_amount: input.paid_amount,
      notes: input.notes || null,
      total_amount: 0,
      balance: 0,
    })
    .select()
    .single();

  if (loadErr) throw new Error(loadErr.message);

  const rows = input.items.map((it) => ({
    load_id: load.id,
    item_id: it.item_id,
    weight: it.weight,
    rate: it.rate,
    subtotal: Math.round(it.weight * it.rate * 100) / 100,
  }));

  const { error: itemsErr } = await supabase.from("load_items").insert(rows);
  if (itemsErr) throw new Error(itemsErr.message);
  // total_amount and balance are recalculated automatically by the
  // load_items trigger in supabase/schema.sql - nothing to do here.

  revalidatePath("/dashboard");
  revalidatePath("/stock");
  revalidatePath("/suppliers");
  revalidatePath("/reports");

  return load.id as string;
}

export async function createLoadAndRedirect(formData: {
  supplier_id: string;
  load_date: string;
  paid_amount: number;
  notes?: string;
  items: LoadItemInput[];
}) {
  const loadId = await createLoad(formData);
  redirect(`/loads/${loadId}`);
}

export async function getLoad(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loads")
    .select("*, suppliers(*), load_items(*, items(*))")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getLoadsForDate(date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loads")
    .select("*, suppliers(name), load_items(*, items(name))")
    .eq("load_date", date)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getLoadsInRange(start: string, end: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loads")
    .select("*, suppliers(name), load_items(*, items(name))")
    .gte("load_date", start)
    .lte("load_date", end)
    .order("load_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getRecentLoads(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("loads")
    .select("*, suppliers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePayment(loadId: string, paidAmount: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("loads")
    .update({ paid_amount: paidAmount })
    .eq("id", loadId);
  if (error) throw new Error(error.message);
  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/suppliers");
  revalidatePath("/dashboard");
}
