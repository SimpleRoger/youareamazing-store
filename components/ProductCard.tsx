"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ShopifyProduct } from "@/types/shopify";
import { formatPrice } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: ShopifyProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const allImages = product.images.edges;
  // Use locally processed (background-removed) images when available
  // image-2.png = background-removed product flat shot (2nd Shopify image)
  // image-1.png = background-removed model shot (1st Shopify image) — we don't use this
  const localPrimary = `/products/${product.handle}/image-2.png`;
  const shopifyFallback = allImages[1]?.node ?? allImages[0]?.node; // product flat shot
  const shopifyImage = shopifyFallback;
  const shopifySecond = allImages[0]?.node; // model photo — shown on hover, original (no bg removal)

  const localImage1 = `/products/${product.handle}/image-1.png`;
  const [imgSrc, setImgSrc] = useState(localPrimary);
  const [imgFallbackUsed, setImgFallbackUsed] = useState(false);
  const [isShopifyFallback, setIsShopifyFallback] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  // Always use original Shopify URL for model/hover shot — don't remove background from people
  const img2Src = shopifySecond?.url ?? "";

  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.variants.edges[0]?.node.compareAtPrice;

  // Get size option
  const sizeOption = product.options.find(o =>
    o.name.toLowerCase() === "size" || o.name.toLowerCase() === "sizes"
  );

  const variants = product.variants.edges.map(e => e.node);

  function abbrevSize(size: string) {
    const map: Record<string, string> = {
      "xs": "XS", "xsmall": "XS", "x-small": "XS", "extra small": "XS",
      "s": "S", "small": "S",
      "m": "M", "medium": "M",
      "l": "L", "large": "L",
      "xl": "XL", "xlarge": "XL", "x-large": "XL", "extra large": "XL",
      "xxl": "XXL", "xxlarge": "XXL", "xx-large": "XXL", "2xl": "XXL", "2x-large": "XXL",
    };
    return map[size.toLowerCase().replace(/\s+/g, " ").trim()] ?? size;
  }

  function getVariantForSize(size: string) {
    return variants.find(v =>
      v.selectedOptions.some(o => o.value === size)
    );
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    const variantId = selectedVariantId ?? variants[0]?.id;
    if (!variantId) return;
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    addItem({
      variantId,
      productId: product.id,
      handle: product.handle,
      title: product.title,
      variantTitle: variant.title !== "Default Title" ? variant.title : "",
      price: variant.price,
      image: shopifyImage ? { url: shopifyImage.url, altText: shopifyImage.altText ?? product.title } : undefined,
      quantity: 1,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const hasOneVariant = variants.length === 1 && variants[0]?.title === "Default Title";

  return (
    <div className="group relative flex flex-col">
      <Link href={`/products/${product.handle}`} className="block flex-1 flex flex-col">
        {/* Square image */}
        <div className="relative aspect-[3/4] bg-white overflow-hidden mb-3">
          {shopifyImage && !imgBroken ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={shopifyImage.altText ?? product.title}
                onError={() => {
                  if (!imgFallbackUsed) {
                    setImgFallbackUsed(true);
                    setImgSrc(localImage1);
                  } else if (!isShopifyFallback && shopifyFallback?.url) {
                    setIsShopifyFallback(true);
                    setImgSrc(shopifyFallback.url);
                  } else {
                    setImgBroken(true);
                  }
                }}
                className={`absolute transition-opacity duration-500 ${shopifySecond ? "group-hover:opacity-0" : ""} ${isShopifyFallback ? "inset-0 w-full h-full object-cover object-top" : "inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain"}`}
              />
              {shopifySecond && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img2Src}
                  alt={shopifySecond.altText ?? product.title}
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* Product info — flex-1 fills row height; price sits at bottom of this section */}
        <div className="flex flex-col flex-1 mb-2 pt-2">
          <h3 className="text-[12px] text-black leading-snug line-clamp-2">{product.title}</h3>
          <div className="flex items-center gap-2 mt-auto pt-1">
            <p className="text-[12px] text-black">{formatPrice(price.amount, price.currencyCode)}</p>
            {comparePrice && parseFloat(comparePrice.amount) > parseFloat(price.amount) && (
              <p className="text-[12px] text-gray-400 line-through">
                {formatPrice(comparePrice.amount, comparePrice.currencyCode)}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Size selector + Add to Cart — pushed to bottom of card */}
      <div className="mt-auto">
      <div className="flex flex-wrap gap-1 mb-2">
      {!hasOneVariant && sizeOption ? (
        sizeOption.values.map(size => {
            const variant = getVariantForSize(size);
            const available = variant?.availableForSale ?? false;
            const isSelected = selectedVariantId === variant?.id;
            return (
              <button
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  if (!available || !variant) return;
                  setSelectedVariantId(isSelected ? null : variant.id);
                }}
                disabled={!available}
                className={`text-[10px] px-1.5 py-0.5 border transition-colors ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : available
                    ? "border-gray-300 text-black hover:border-black"
                    : "border-gray-100 text-gray-300 line-through cursor-not-allowed"
                }`}
              >
                {abbrevSize(size)}
              </button>
            );
          })
      ) : (
        <span className="text-[10px] px-1.5 py-0.5 border border-gray-300 text-black">
          One Size
        </span>
      )}
      </div>

      <button
        onClick={handleAddToCart}
        className={`w-full text-[11px] py-2 border font-medium uppercase tracking-wider transition-all duration-200 ${
          added
            ? "border-green-600 bg-green-600 text-white scale-[0.98]"
            : "border-black text-black hover:bg-black hover:text-white"
        }`}
      >
        {added ? "✓ Added" : "Add To Cart"}
      </button>
      </div>
    </div>
  );
}
