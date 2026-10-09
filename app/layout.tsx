import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "You Are Amazing",
  description: "Fashion forward clothing — free shipping to Australia, shipping worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-black">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <CartDrawer />
        </CartProvider>
        <Script
          src="//code.tidio.co/ztp8w47ozciitu3c3qz4gezsxk6txe5g.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
