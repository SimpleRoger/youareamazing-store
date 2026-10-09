import { Suspense } from "react";
import { getAllProducts } from "@/lib/shopify";
import CollectionPage from "@/components/CollectionPage";

export const dynamic = "force-dynamic";

const HIDDEN_HANDLES = ["live-love-pyjammas"];

export default async function HomePage() {
  let products;
  let errorMsg = "";
  try {
    products = await getAllProducts(100);
  } catch (e: any) {
    errorMsg = e?.message ?? String(e);
    products = [];
  }
  const visible = (products ?? []).filter((p: any) => !HIDDEN_HANDLES.includes(p.handle));
  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-xs uppercase tracking-widest text-red-500 mb-4">Shopify Error</p>
        <pre className="text-left text-xs bg-gray-100 p-4 rounded overflow-auto">{errorMsg}</pre>
        <p className="text-gray-500 text-xs mt-4">DOMAIN: {process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "MISSING"}</p>
      </div>
    );
  }
  return (
    <Suspense>
      <CollectionPage products={visible} />
    </Suspense>
  );
}
