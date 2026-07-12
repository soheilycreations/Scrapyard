"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function createSupplier(name: string, phone: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({ name: name.trim(), phone: phone.trim() || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/loads/new");
  revalidatePath("/suppliers");
  return data;
}

export async function updateSupplier(id: string, name: string, phone: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update({ name: name.trim(), phone: phone.trim() || null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/suppliers");
}

export async function getSupplierLedger(supplierId: string) {
  const supabase = await createClient();

  const { data: supplier, error: supErr } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", supplierId)
    .single();
  if (supErr) throw new Error(supErr.message);

  const { data: loads, error: loadErr } = await supabase
    .from("loads")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("load_date", { ascending: false });
  if (loadErr) throw new Error(loadErr.message);

  const summary = (loads ?? []).reduce(
    (acc, l) => {
      acc.totalLoads += 1;
      acc.totalAmount += Number(l.total_amount);
      acc.totalPaid += Number(l.paid_amount);
      acc.totalBalance += Number(l.balance);
      return acc;
    },
    { totalLoads: 0, totalAmount: 0, totalPaid: 0, totalBalance: 0 }
  );

  return { supplier, loads: loads ?? [], summary };
}
