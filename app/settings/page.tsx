import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getAllItems } from "@/lib/actions/items";
import ItemManager from "./ItemManager";
import PasswordChanger from "./PasswordChanger";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const items = await getAllItems();

  return (
    <>
      <PageHeader title="Settings" subtitle="Admin only" back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-5">
        <ItemManager items={items} />
        <PasswordChanger />

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-2 text-sm font-bold text-slate-400">Export data</h2>
          <p className="mb-3 text-xs text-slate-500">
            Full Excel/PDF export coming soon. For now, use Reports to view any date range.
          </p>
        </section>

        <LogoutButton />
      </main>
      <BottomNav />
    </>
  );
}
