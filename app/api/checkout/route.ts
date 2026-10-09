import { NextResponse } from "next/server";

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

// checkoutCreate returns webUrl → checkout.shopify.com/... which bypasses custom domain redirects.
// cartCreate returns checkoutUrl → store primary domain, which loops back through Next.js /cart.
const CHECKOUT_CREATE = `
  mutation checkoutCreate($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout { webUrl }
      checkoutUserErrors { field message }
    }
  }
`;

export async function POST(req: Request) {
  const { items } = await req.json() as {
    items: Array<{ variantId: string; quantity: number }>;
  };

  const lineItems = items.map(i => ({ variantId: i.variantId, quantity: i.quantity }));

  const res = await fetch(`https://${DOMAIN}/api/2024-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query: CHECKOUT_CREATE, variables: { input: { lineItems } } }),
    cache: "no-store",
  });

  const json = await res.json();
  const errs = json?.data?.checkoutCreate?.checkoutUserErrors;
  if (errs?.length) return NextResponse.json({ error: errs[0].message }, { status: 400 });

  const webUrl = json?.data?.checkoutCreate?.checkout?.webUrl;
  if (!webUrl) return NextResponse.json({ error: "No checkout URL" }, { status: 500 });

  return NextResponse.json({ url: webUrl });
}
