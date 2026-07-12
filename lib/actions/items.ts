"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getActiveItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function getAllItems() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("name");
  if (error) throw new Error(error.message);
  return data;
}

export async function createItem(name: string, defaultRate: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("items")
    .insert({ name: name.trim(), default_rate: defaultRate, active: true });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/loads/new");
}

export async function updateItem(
  id: string,
  fields: Partial<{ name: string; default_rate: number; active: boolean }>
) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  revalidatePath("/loads/new");
}

/**
 * Permanently removes an item type. If the item has ever been used in a
 * load, the database will refuse (foreign key restrict) since deleting it
 * would corrupt load history - in that case we return a friendly error so
 * the UI can suggest disabling instead.
 */
export async function deleteItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        error:
          "මේ item එක past load එකකට use වෙලා තියෙනවා - delete කරන්න බෑ. Disable කරන්න පුළුවන්.",
      };
    }
    return { error: error.message };
  }
  revalidatePath("/settings");
  revalidatePath("/loads/new");
  return { success: true };
}
