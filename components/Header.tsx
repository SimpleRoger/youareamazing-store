"use client";

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Search, User } from "./Icons";

const NAV_LINKS = [
  { label: "*shop all*", href: "/" },
  { label: "hoodies", href: "/collections/hoodies" },
  { label: "tops & tees", href: "/collections/tops" },
  { label: "bottoms", href: "/collections/bottoms" },
  { label: "footwear", href: "/collections/footwear" },
  { label: "outerwear", href: "/collections/outerwear" },
  { label: "hats", href: "/collections/hats" },
  { label: "bags", href: "/collections/bags" },
  { label: "waitlist", href: "/waitlist" },
];

export default function Header() {
  const { itemCount, openCart } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      {/* Logo row */}
      <div className="relative flex items-center justify-between h-20 px-4 md:px-8">
        {/* Left — mobile hamburger */}
        <button
          className="md:hidden p-1 text-black"
          aria-label="Menu"
          onClick={() => setMobileNavOpen(o => !o)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            {mobileNavOpen ? (
              <>
                <line x1="3" y1="3" x2="15" y2="15" />
                <line x1="15" y1="3" x2="3" y2="15" />
              </>
            ) : (
              <>
                <line x1="2" y1="5" x2="16" y2="5" />
                <line x1="2" y1="9" x2="16" y2="9" />
                <line x1="2" y1="13" x2="16" y2="13" />
              </>
            )}
          </svg>
        </button>
        <div className="hidden md:block w-8" />

        {/* Center logo */}
        <Link href="/" className="flex-1 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-black.png"
            alt="You Are Amazing"
            className="h-16 w-auto object-contain"
          />
        </Link>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(o => !o)}
            className="hidden md:flex text-black hover:opacity-60 transition-opacity"
          >
            <Search size={18} />
          </button>
          <a
            href="https://856d64-2.myshopify.com/account"
            aria-label="Account"
            className="hidden md:flex text-black hover:opacity-60 transition-opacity"
          >
            <User size={18} />
          </a>
          <button
            aria-label="Cart"
            onClick={openCart}
            className="relative flex text-black hover:opacity-60 transition-opacity"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Nav row — full width, centered (desktop) */}
      <nav className="hidden md:flex overflow-x-auto justify-center border-t border-gray-100 px-4 scrollbar-hide">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-[11px] text-black hover:opacity-60 whitespace-nowrap transition-opacity py-2.5 px-3"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-white px-4 md:px-8 py-3 flex items-center gap-3">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && query.trim()) {
                window.location.href = `/?q=${encodeURIComponent(query.trim())}`;
                setSearchOpen(false);
                setQuery("");
              }
              if (e.key === "Escape") { setSearchOpen(false); setQuery(""); }
            }}
            placeholder="Search products…"
            className="flex-1 text-[13px] outline-none bg-transparent placeholder-gray-400"
          />
          <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="text-gray-400 hover:text-black transition-colors text-[11px] uppercase tracking-widest">
            Cancel
          </button>
        </div>
      )}

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <nav className="md:hidden border-t border-gray-100 bg-white">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileNavOpen(false)}
              className="block text-[13px] text-black px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
