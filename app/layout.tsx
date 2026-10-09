import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";

async function getShopId(): Promise<string | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return null;
  try {
    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token },
      body: JSON.stringify({ query: "{ shop { id } }" }),
      cache: "no-store",
    });
    const json = await res.json();
    return json?.data?.shop?.id ?? null;
  } catch {
    return null;
  }
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "You Are Amazing",
  description: "Fashion forward clothing — free shipping to Australia, shipping worldwide.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shopId = await getShopId();

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-black">
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <CartDrawer />
        </CartProvider>
        {shopId && (
          <>
            <Script id="shopify-inbox-config" strategy="afterInteractive">
              {`window.shopifyInboxConfig = { shopId: '${shopId}' };`}
            </Script>
            <Script
              src="https://cdn.shopify.com/shopifycloud/chat/latest/storefront-chat.js"
              strategy="lazyOnload"
            />
          </>
        )}
      </body>
    </html>
  );
}
