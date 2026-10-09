import type { ShopifyProduct } from "@/types/shopify";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: ShopifyProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 text-xs uppercase tracking-widest">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
