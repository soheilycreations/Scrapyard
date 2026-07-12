import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getSuppliers } from "@/lib/actions/suppliers";
import { getActiveItems } from "@/lib/actions/items";
import LoadEntryForm from "./LoadEntryForm";

export const dynamic = "force-dynamic";

export default async function NewLoadPage() {
  const [suppliers, items] = await Promise.all([getSuppliers(), getActiveItems()]);

  return (
    <>
      <PageHeader title="Load Add කරන්න" subtitle="New load entry" back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
        <LoadEntryForm suppliers={suppliers} items={items} />
      </main>
      <BottomNav />
    </>
  );
}
