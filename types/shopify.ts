export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: MoneyV2;
  compareAtPrice: MoneyV2 | null;
  selectedOptions: SelectedOption[];
  image?: { url: string } | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  images: {
    edges: Array<{ node: ShopifyImage }>;
  };
  variants: {
    edges: Array<{ node: ShopifyVariant }>;
  };
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  tags: string[];
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
  products: {
    edges: Array<{ node: ShopifyProduct }>;
  };
}

// Cart types
export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string;
  handle: string;
  price: MoneyV2;
  image: ShopifyImage | null;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}
