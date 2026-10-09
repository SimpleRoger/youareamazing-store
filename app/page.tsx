import { Suspense } from "react";
import { getAllProducts } from "@/lib/shopify";
import CollectionPage from "@/components/CollectionPage";

export const dynamic = "force-dynamic";

const HIDDEN_HANDLES = ["live-love-pyjammas"];

export default async function HomePage() {
  const products = await getAllProducts(100);
  const visible = products.filter(p => !HIDDEN_HANDLES.includes(p.handle));
  return (
    <Suspense>
      <CollectionPage products={visible} />
    </Suspense>
  );
}
