import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getSale } from "@/lib/actions/sales";
import { getStock } from "@/lib/actions/stock";
import SaleDetailClient from "./SaleDetailClient";

export const dynamic = "force-dynamic";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [sale, stock] = await Promise.all([getSale(id), getStock()]);

  return (
    <>
      <PageHeader title={`Sale #${sale.sale_number}`} subtitle="View or edit this sale" back />
      <main className="mx-auto max-w-lg px-4 pb-28 pt-4 space-y-5">
        <SaleDetailClient sale={sale} stock={stock} />
      </main>
      <BottomNav />
    </>
  );
}
