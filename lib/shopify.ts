import type { ShopifyProduct, ShopifyCollection } from "@/types/shopify";

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const SHOPIFY_API_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

interface ShopifyFetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
  tags?: string[];
}

async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  tags,
}: ShopifyFetchOptions): Promise<T> {
  const response = await fetch(SHOPIFY_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    ...(tags ? { next: { tags } } : {}),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0]?.message ?? "Shopify GraphQL error");
  }

  return json.data as T;
}

// ─── Fragments ────────────────────────────────────────────────────────────────

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    tags
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    images(first: 10) {
      edges { node { url altText width height } }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url }
        }
      }
    }
    options {
      id
      name
      values
    }
  }
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

const GET_ALL_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetAllProducts($first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, sortKey: $sortKey, reverse: $reverse) {
      edges { node { ...ProductFields } }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFields
    }
  }
`;

const GET_COLLECTION_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetCollection($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      description
      image { url altText width height }
      products(first: $first) {
        edges { node { ...ProductFields } }
      }
    }
  }
`;

const GET_ALL_COLLECTIONS_QUERY = `
  query GetAllCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image { url altText }
        }
      }
    }
  }
`;

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getAllProducts(first = 50, sortKey = "BEST_SELLING"): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<{
    products: { edges: Array<{ node: ShopifyProduct }> };
  }>({
    query: GET_ALL_PRODUCTS_QUERY,
    variables: { first, sortKey },
    tags: ["products"],
  });
  return data.products.edges.map((e) => e.node);
}

export async function getProductByHandle(
  handle: string
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<{
    productByHandle: ShopifyProduct | null;
  }>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
    tags: [`product-${handle}`],
  });
  return data.productByHandle;
}

export async function getCollectionByHandle(
  handle: string,
  first = 50
): Promise<ShopifyCollection | null> {
  const data = await shopifyFetch<{
    collectionByHandle: ShopifyCollection | null;
  }>({
    query: GET_COLLECTION_QUERY,
    variables: { handle, first },
    tags: [`collection-${handle}`],
  });
  return data.collectionByHandle;
}

export async function getAllCollections(first = 20): Promise<
  Array<{
    id: string;
    title: string;
    handle: string;
    description: string;
    image: { url: string; altText: string } | null;
  }>
> {
  const data = await shopifyFetch<{
    collections: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          description: string;
          image: { url: string; altText: string } | null;
        };
      }>;
    };
  }>({
    query: GET_ALL_COLLECTIONS_QUERY,
    variables: { first },
    tags: ["collections"],
  });
  return data.collections.edges.map((e) => e.node);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(num);
}
