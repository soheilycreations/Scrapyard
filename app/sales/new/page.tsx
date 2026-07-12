import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import SaleForm from "@/components/SaleForm";
import { getStock } from "@/lib/actions/stock";

export const dynamic = "force-dynamic";

export default async function NewSalePage() {
  const stock = await getStock();
  // only items that actually have stock available can be sold
  const sellableStock = stock.filter((s: any) => Number(s.total_weight) > 0);

  return (
    <>
      <PageHeader title="Sell Stock" subtitle="Resell to factory/buyer" back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4">
        <SaleForm stock={sellableStock} />
      </main>
      <BottomNav />
    </>
  );
}
