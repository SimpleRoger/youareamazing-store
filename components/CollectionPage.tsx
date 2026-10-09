"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ShopifyProduct } from "@/types/shopify";
import ProductCard from "./ProductCard";

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Most relevant", value: "relevant" },
  { label: "Best selling", value: "best-selling" },
  { label: "Alphabetically, A-Z", value: "alpha-asc" },
  { label: "Alphabetically, Z-A", value: "alpha-desc" },
  { label: "Price, low to high", value: "price-asc" },
  { label: "Price, high to low", value: "price-desc" },
  { label: "Date, old to new", value: "date-asc" },
  { label: "Date, new to old", value: "date-desc" },
];

interface Props {
  products: ShopifyProduct[];
  title?: string;
}

export default function CollectionPage({ products, title = "All Products" }: Props) {
  const [sort, setSort] = useState("best-selling");
  const [sortOpen, setSortOpen] = useState(false);
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase().trim() ?? "";

  const filtered = useMemo(() =>
    query ? products.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.tags.some(t => t.toLowerCase().includes(query))
    ) : products,
  [products, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "alpha-asc": return arr.sort((a, b) => a.title.localeCompare(b.title));
      case "alpha-desc": return arr.sort((a, b) => b.title.localeCompare(a.title));
      case "price-asc": return arr.sort((a, b) => parseFloat(a.priceRange.minVariantPrice.amount) - parseFloat(b.priceRange.minVariantPrice.amount));
      case "price-desc": return arr.sort((a, b) => parseFloat(b.priceRange.minVariantPrice.amount) - parseFloat(a.priceRange.minVariantPrice.amount));
      default: return arr;
    }
  }, [products, sort]);

  const currentLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Featured";

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[11px] uppercase tracking-widest text-black font-medium">
          {query ? `Search: "${query}"` : title}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-gray-400">{sorted.length} products</span>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(o => !o)}
              className="flex items-center gap-1.5 text-[11px] text-black hover:opacity-60 transition-opacity"
            >
              Sort by: <span className="font-medium">{currentLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M5 7L1 3h8L5 7z" />
              </svg>
            </button>

            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-6 z-50 bg-white border border-gray-200 shadow-lg min-w-[200px] py-1">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setSort(o.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 transition-colors ${sort === o.value ? "font-medium" : ""}`}
                    >
                      {sort === o.value && <span className="mr-1">✓</span>}{o.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xs uppercase tracking-widest">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-12">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 5} />
          ))}
        </div>
      )}
    </div>
  );
}
