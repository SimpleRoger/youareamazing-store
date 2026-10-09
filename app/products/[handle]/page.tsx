import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductByHandle, formatPrice } from "@/lib/shopify";
import AddToCart from "./AddToCart";
import ImageGallery from "./ImageGallery";

const SIZE_CHARTS: Record<string, { cols: string[]; rows: string[][] }> = {
  "skinny-jeans": {
    cols: ["Size", "Waist", "Hip", "Inseam", "Height"],
    rows: [
      ["S", '28–30"', '36–38"', '30"', "5'6\"–5'9\""],
      ["M", '30–32"', '38–40"', '30"', "5'8\"–5'11\""],
      ["L", '32–34"', '40–42"', '31"', "5'10\"–6'1\""],
    ],
  },
  "baggy-jeans": {
    cols: ["Size", "Waist", "Hip", "Inseam", "Height"],
    rows: [
      ["S", '28–30"', '38–40"', '30"', "5'6\"–5'9\""],
      ["M", '30–32"', '40–42"', '30"', "5'8\"–5'11\""],
      ["L", '32–34"', '42–44"', '31"', "5'10\"–6'1\""],
    ],
  },
  "untitled-dec14_21-11": {
    cols: ["Size", "Chest", "Length", "Shoulder"],
    rows: [
      ["XS", '34–36"', '25"', '16"'],
      ["S",  '36–38"', '26"', '17"'],
      ["M",  '38–40"', '27"', '18"'],
      ["L",  '40–42"', '28"', '19"'],
    ],
  },
};

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product Not Found" };
  const image = product.images.edges[0]?.node;
  return {
    title: `${product.title} — You Are Amazing`,
    description: product.description,
    openGraph: image
      ? { images: [{ url: image.url, alt: image.altText ?? product.title }] }
      : undefined,
  };
}

const HIDDEN_HANDLES = ["live-love-pyjammas"];

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product || HIDDEN_HANDLES.includes(handle)) notFound();

  const images = product.images.edges.map((e) => e.node);
  const price = product.priceRange.minVariantPrice;
  const firstVariant = product.variants.edges[0]?.node;
  const compareAtPrice = firstVariant?.compareAtPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-black">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Image gallery */}
        <ImageGallery images={images} title={product.title} />

        {/* Right: Product info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xl font-semibold">
                {formatPrice(price.amount, price.currencyCode)}
              </span>
              {compareAtPrice &&
                parseFloat(compareAtPrice.amount) > parseFloat(price.amount) && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(
                      compareAtPrice.amount,
                      compareAtPrice.currencyCode
                    )}
                  </span>
                )}
            </div>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 border border-gray-200 text-xs text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Add to cart (client component — handles size selection) */}
          <AddToCart product={product} />

          {/* Description */}
          {product.description && (
            <div className="border-t border-gray-100 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3">
                Description
              </h2>
              <div
                className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
              {SIZE_CHARTS[handle] && (
                <div className="overflow-x-auto mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2">Size Chart</h3>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {SIZE_CHARTS[handle].cols.map(col => (
                          <th key={col} className="border border-gray-200 px-3 py-2 text-left font-medium uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SIZE_CHARTS[handle].rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          {row.map((cell, j) => (
                            <td key={j} className="border border-gray-200 px-3 py-2">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Shipping info */}
          <div className="border border-gray-100 p-4 text-xs text-gray-600 space-y-1">
            <p>✓ Free shipping within Australia</p>
            <p>✓ Worldwide shipping available</p>
            <p>✓ Easy returns within 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
