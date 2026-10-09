import { NextResponse } from "next/server";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;

export async function POST(req: Request) {
  const { items } = await req.json() as {
    items: Array<{ variantId: string; quantity: number }>;
  };

  // Build Shopify cart permalink — works for any headless store
  // variantId is a GID like "gid://shopify/ProductVariant/12345" — extract the numeric part
  const lineItems = items
    .map(i => {
      const numericId = i.variantId.split("/").pop() ?? i.variantId;
      return `${numericId}:${i.quantity}`;
    })
    .join(",");

  const url = `https://${DOMAIN}/cart/${lineItems}`;
  return NextResponse.json({ url });
}
