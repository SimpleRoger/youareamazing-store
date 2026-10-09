"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus } from "./Icons";
import type { CartItem } from "@/types/shopify";

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN  = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

async function fetchVariants(handle: string) {
  const res = await fetch(`https://${DOMAIN}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({
      query: `query($handle:String!){productByHandle(handle:$handle){options{name values} variants(first:50){edges{node{id title availableForSale price{amount currencyCode} selectedOptions{name value}}}}}}`,
      variables: { handle },
    }),
  });
  const j = await res.json();
  return j.data?.productByHandle ?? null;
}

const SIZE_ORDER = ["XS","X-Small","Extra Small","S","Small","M","Medium","L","Large","XL","X-Large","Extra Large","XXL","XX-Large","2XL","One Size"];
function sortSizes(vals: string[]) {
  return [...vals].sort((a, b) => {
    const ai = SIZE_ORDER.findIndex(s => s.toLowerCase() === a.toLowerCase());
    const bi = SIZE_ORDER.findIndex(s => s.toLowerCase() === b.toLowerCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1; if (bi === -1) return -1;
    return ai - bi;
  });
}

function VariantEditor({ item, onSwap, onClose }: {
  item: CartItem;
  onSwap: (newVariantId: string, newTitle: string, newPrice: CartItem["price"]) => void;
  onClose: () => void;
}) {
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!item.handle) { setError(true); return; }
    fetchVariants(item.handle).then(p => {
      if (!p) { setError(true); return; }
      setProduct(p);
      const parts = item.variantTitle.split(" / ");
      const init: Record<string, string> = {};
      p.options.forEach((opt: any, i: number) => {
        init[opt.name] = parts[i] ?? opt.values[0];
      });
      setSelections(init);
    }).catch(() => setError(true));
  }, [item.handle, item.variantTitle]);

  if (error) return (
    <div className="mt-2 border-t border-gray-100 pt-2">
      <p className="text-[10px] text-gray-400">Can't load options — <a href={`/products/${item.handle}`} className="underline text-black">edit on product page</a></p>
      <button onClick={onClose} className="text-[10px] text-gray-400 mt-1 underline">Cancel</button>
    </div>
  );
  if (!product) return <p className="text-[10px] text-gray-400 py-2">Loading…</p>;

  const selectedVariant = product.variants.edges.find((e: any) =>
    e.node.selectedOptions.every((opt: any) => selections[opt.name] === opt.value)
  )?.node;

  function handleSelect(optName: string, val: string) {
    setSelections(prev => ({ ...prev, [optName]: val }));
  }

  function handleApply() {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    onSwap(selectedVariant.id, selectedVariant.title, selectedVariant.price);
    onClose();
  }

  return (
    <div className="mt-2 space-y-2 border-t border-gray-100 pt-2">
      {product.options.map((opt: any) => {
        const isSize = opt.name.toLowerCase() === "size";
        const values = isSize ? sortSizes(opt.values) : opt.values;
        return (
          <div key={opt.name}>
            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">{opt.name}</p>
            <div className="flex flex-wrap gap-1">
              {values.map((val: string) => {
                const testSels = { ...selections, [opt.name]: val };
                const variant = product.variants.edges.find((e: any) =>
                  e.node.selectedOptions.every((o: any) => testSels[o.name] === o.value)
                )?.node;
                const avail = variant?.availableForSale ?? false;
                const isSel = selections[opt.name] === val;
                return (
                  <button
                    key={val}
                    onClick={() => avail && handleSelect(opt.name, val)}
                    disabled={!avail}
                    className={`text-[10px] px-2 py-0.5 border transition-colors ${
                      isSel ? "border-black bg-black text-white"
                      : avail ? "border-gray-300 text-black hover:border-black"
                      : "border-gray-100 text-gray-300 line-through cursor-not-allowed"
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleApply}
          disabled={!selectedVariant?.availableForSale || selectedVariant?.id === item.variantId}
          className="text-[10px] uppercase tracking-widest px-3 py-1.5 bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Update
        </button>
        <button onClick={onClose} className="text-[10px] uppercase tracking-widest px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-black transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, addItem, subtotal, itemCount } = useCart();
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleSwap(oldItem: CartItem, newVariantId: string, newTitle: string, newPrice: CartItem["price"]) {
    const qty = oldItem.quantity;
    removeItem(oldItem.variantId);
    addItem({ ...oldItem, variantId: newVariantId, variantTitle: newTitle, price: newPrice, quantity: qty });
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 transition-opacity" onClick={closeCart} aria-hidden="true" />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-widest">
            Cart {itemCount > 0 && `(${itemCount})`}
          </h2>
          <button onClick={closeCart} className="text-gray-500 hover:text-black transition-colors" aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <button onClick={closeCart} className="text-xs uppercase tracking-wider font-medium underline underline-offset-4">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {items.map((item) => {
                const isEditing = editingId === item.variantId;
                return (
                  <li key={item.variantId} className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-24 flex-shrink-0 bg-gray-50 overflow-hidden">
                      {item.image ? (
                        <Image src={item.image.url} alt={item.image.altText ?? item.title} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.handle}`} onClick={closeCart} className="text-sm font-medium text-black hover:underline leading-tight block truncate">
                        {item.title}
                      </Link>

                      {/* Variant label — click to edit */}
                      {item.variantTitle && item.variantTitle !== "Default Title" && (
                        <button
                          onClick={() => setEditingId(isEditing ? null : item.variantId)}
                          className="text-xs text-gray-500 mt-0.5 hover:text-black transition-colors flex items-center gap-1"
                        >
                          {item.variantTitle}
                          <span className="text-[9px] uppercase tracking-widest text-gray-400 border border-gray-200 px-1 py-px">
                            {isEditing ? "✕" : "Edit"}
                          </span>
                        </button>
                      )}

                      <p className="text-sm font-medium mt-1">
                        {new Intl.NumberFormat("en-AU", { style: "currency", currency: item.price.currencyCode, minimumFractionDigits: 2 }).format(parseFloat(item.price.amount) * item.quantity)}
                      </p>

                      {/* Inline variant editor */}
                      {isEditing && (
                        <VariantEditor
                          item={item}
                          onSwap={(vid, vt, vp) => handleSwap(item, vid, vt, vp)}
                          onClose={() => setEditingId(null)}
                        />
                      )}

                      {/* Quantity controls */}
                      {!isEditing && (
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:border-black transition-colors" aria-label="Decrease quantity">
                            <Minus size={12} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center border border-gray-300 hover:border-black transition-colors" aria-label="Increase quantity">
                            <Plus size={12} />
                          </button>
                          <button onClick={() => removeItem(item.variantId)} className="ml-auto text-gray-400 hover:text-black transition-colors" aria-label="Remove item">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>{subtotal}</span>
            </div>
            <p className="text-xs text-gray-500 text-center">Shipping and taxes calculated at checkout</p>
            <Link href="/cart" onClick={closeCart} className="block w-full bg-black text-white text-sm font-medium text-center uppercase tracking-wider py-4 hover:bg-gray-900 transition-colors">
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
