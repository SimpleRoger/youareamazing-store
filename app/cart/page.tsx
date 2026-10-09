"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus } from "@/components/Icons";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart, proceedToCheckout } = useCart();

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white text-sm font-medium uppercase tracking-widest px-8 py-4 hover:bg-gray-900 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-wider">
          Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-5 pb-6 border-b border-gray-100 last:border-0"
            >
              {/* Image */}
              <div className="relative w-24 h-32 flex-shrink-0 bg-gray-50 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image.url}
                    alt={item.image.altText ?? item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/products/${item.handle}`}
                    className="text-sm font-medium text-black hover:underline leading-tight"
                  >
                    {item.title}
                  </Link>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-gray-400 hover:text-black transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
                {item.variantTitle !== "Default Title" && (
                  <p className="text-xs text-gray-500 mt-1">
                    {item.variantTitle}
                  </p>
                )}
                <p className="text-sm font-medium mt-2">
                  {new Intl.NumberFormat("en-AU", {
                    style: "currency",
                    currency: item.price.currencyCode,
                    minimumFractionDigits: 2,
                  }).format(parseFloat(item.price.amount))}
                </p>

                {/* Quantity */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity - 1)
                    }
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 hover:border-black transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.variantId, item.quantity + 1)
                    }
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 hover:border-black transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="flex-shrink-0 text-sm font-medium text-right">
                {new Intl.NumberFormat("en-AU", {
                  style: "currency",
                  currency: item.price.currencyCode,
                  minimumFractionDigits: 2,
                }).format(parseFloat(item.price.amount) * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="border border-gray-100 p-6 space-y-4 sticky top-24">
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-600">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{subtotal}</span>
            </div>

            <p className="text-xs text-gray-500 text-center">
              🛍️ Buy 2+ items = 10% off · Buy 3+ = 15% off
            </p>

            <button
              onClick={proceedToCheckout}
              className="w-full bg-black text-white text-sm font-medium uppercase tracking-widest py-4 hover:bg-gray-900 transition-colors"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/"
              className="block text-center text-xs uppercase tracking-wider text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
