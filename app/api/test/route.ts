import { NextResponse } from "next/server";

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    return NextResponse.json({ error: "Missing env vars", domain: domain ?? "MISSING", tokenLen: token?.length ?? 0 }, { status: 500 });
  }

  try {
    const res = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query: "{ shop { name } }" }),
      cache: "no-store",
    });
    const json = await res.json();
    return NextResponse.json({ ok: res.ok, status: res.status, body: json, domain });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, domain }, { status: 500 });
  }
}
