import { notFound, redirect } from "next/navigation";
import { getProductSlugByEquipmentId } from "@/lib/queries";

// Legacy route: products are now served at /products/[slug]. An old
// /equipment/[id] link (where id is an offering id) redirects to the product
// page that offering belongs to.
interface LegacyEquipmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyEquipmentRedirect({
  params,
}: LegacyEquipmentPageProps) {
  const { id } = await params;
  const slug = await getProductSlugByEquipmentId(id);

  if (!slug) {
    notFound();
  }

  redirect(`/products/${slug}`);
}
