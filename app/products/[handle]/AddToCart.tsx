"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/context/CartContext";
import type { ShopifyProduct, ShopifyVariant } from "@/types/shopify";
import SizeGuideModal from "@/components/SizeGuideModal";

interface AddToCartProps {
  product: ShopifyProduct;
}

const SIZE_ORDER = ["XS","X-Small","Extra Small","S","Small","M","Medium","L","Large","XL","X-Large","Extra Large","XXL","XX-Large","2XL","2X-Large","XXXL","3XL","One Size"];

function sortSizes(values: string[]) {
  return [...values].sort((a, b) => {
    const ai = SIZE_ORDER.findIndex(s => s.toLowerCase() === a.toLowerCase());
    const bi = SIZE_ORDER.findIndex(s => s.toLowerCase() === b.toLowerCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function AddToCart({ product }: AddToCartProps) {
  const { addItem } = useCart();
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Default to the variant whose image matches the first product image,
  // so the selected options always reflect what's actually shown on load.
  const firstImageUrl = product.images.edges[0]?.node.url ?? "";
  const firstMatchingVariant = product.variants.edges.find(
    e => e.node.image?.url && firstImageUrl.includes(e.node.image.url.split("?")[0].split("/").slice(-1)[0].split(".")[0])
  )?.node ?? product.variants.edges[0]?.node;

  const initialSelections: Record<string, string> = {};
  if (firstMatchingVariant) {
    firstMatchingVariant.selectedOptions.forEach(opt => {
      initialSelections[opt.name] = opt.value;
    });
  } else {
    product.options.forEach(opt => {
      initialSelections[opt.name] = opt.values[0] ?? "";
    });
  }
  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);

  // Find variant matching ALL current selections
  const selectedVariant = product.variants.edges.find(e =>
    e.node.selectedOptions.every(opt => selections[opt.name] === opt.value)
  )?.node ?? product.variants.edges[0]?.node;

  function handleSelect(optionName: string, value: string) {
    setSelections(prev => ({ ...prev, [optionName]: value }));
  }

  const handleAddToCart = () => {
    if (!selectedVariant?.availableForSale) return;
    const image = product.images.edges[0]?.node ?? null;
    startTransition(() => {
      addItem({
        variantId: selectedVariant.id,
        productId: product.id,
        title: product.title,
        variantTitle: selectedVariant.title,
        handle: product.handle,
        price: selectedVariant.price,
        image: image ? { url: image.url, altText: image.altText } : null,
        quantity: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  const isAvailable = selectedVariant?.availableForSale ?? false;

  const currentSize = selections["Size"] ?? selections["size"] ?? "";

  return (
    <div className="space-y-5">
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        defaultSize={currentSize}
      />

      {product.options.map(option => {
        const isSize = option.name.toLowerCase() === "size";
        const values = isSize ? sortSizes(option.values) : option.values;

        return (
          <div key={option.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-700">
                {option.name}
              </span>
              {isSize && (
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors underline underline-offset-2"
                >
                  Size guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {values.map(value => {
                // Check if this option value has any available variant
                const testSelections = { ...selections, [option.name]: value };
                const matchingVariant = product.variants.edges.find(e =>
                  e.node.selectedOptions.every(opt => testSelections[opt.name] === opt.value)
                )?.node;
                const available = matchingVariant?.availableForSale ?? false;
                const isSelected = selections[option.name] === value;

                return (
                  <button
                    key={value}
                    onClick={() => handleSelect(option.name, value)}
                    disabled={!available}
                    className={`min-w-[48px] h-10 px-3 border text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-black bg-black text-white"
                        : available
                        ? "border-gray-300 text-black hover:border-black"
                        : "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={handleAddToCart}
        disabled={!isAvailable || isPending}
        className={`w-full py-4 text-sm font-medium uppercase tracking-widest transition-colors ${
          isAvailable
            ? added
              ? "bg-gray-800 text-white"
              : "bg-black text-white hover:bg-gray-900"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {!isAvailable ? "Sold Out" : added ? "Added to Cart!" : isPending ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
