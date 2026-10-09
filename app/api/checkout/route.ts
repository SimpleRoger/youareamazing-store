import { NextResponse } from "next/server";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }
`;

export async function POST(req: Request) {
  const { items } = await req.json() as {
    items: Array<{ variantId: string; quantity: number }>;
  };

  const lines = items.map(i => ({ merchandiseId: i.variantId, quantity: i.quantity }));

  const res = await fetch(`https://${DOMAIN}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query: CART_CREATE, variables: { input: { lines } } }),
    cache: "no-store",
  });

  const json = await res.json();
  const errs = json?.data?.cartCreate?.userErrors;
  if (errs?.length) return NextResponse.json({ error: errs[0].message }, { status: 400 });

  const checkoutUrl = json?.data?.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) return NextResponse.json({ error: "No checkout URL" }, { status: 500 });

  return NextResponse.json({ url: checkoutUrl });
}
