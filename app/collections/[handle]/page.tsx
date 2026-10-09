import { getCollectionByHandle, getAllProducts } from "@/lib/shopify";
import CollectionPage from "@/components/CollectionPage";

const HIDDEN_HANDLES = ["live-love-pyjammas"];

// Manual category map — add product handles here as you add products
const CATEGORY_MAP: Record<string, string[]> = {
  "tops": ["be-yourself-tee","you-are-amazing-tee","you-are-amazing-tg","south-park-tee","for-you","love-my-ex","china-shirt","face-it","be-happy-have-fun-tee","want-u","lets-link","life-is-beautiful-polo"],
  "tops-tees": ["be-yourself-tee","you-are-amazing-tee","you-are-amazing-tg","south-park-tee","for-you","love-my-ex","china-shirt","face-it","be-happy-have-fun-tee","want-u","lets-link","life-is-beautiful-polo"],
  "hoodies": ["punk-fur-zip-up","handdrawn-zip-up","soul-mate-fur-zip-up","lily-chou-chou-zip-up","be-happy-have-fun-zip-up","untitled-dec14_21-11","love-fur-zip-up"],
  "outerwear": ["punk-fur-zip-up","handdrawn-zip-up","soul-mate-fur-zip-up","lily-chou-chou-zip-up","be-happy-have-fun-zip-up","untitled-dec14_21-11","love-fur-zip-up"],
  "bottoms": ["baggy-jeans","skinny-jeans","china-pants","4you-pants-w-you-are-amazing-boxers"],
  "hats": ["you-are-amazing-nana-beanie","spinner-hat"],
  "bags": [],
  "footwear": ["4you-slippers"],
  "accessories": ["you-are-amazing-underwear-3-pack","you-are-amazing-panties-3-pack"],
};

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);
  const title = collection?.title ?? handle.replace(/-/g, " ");
  return {
    title: `${title} — You Are Amazing`,
  };
}

export default async function CollectionRoute({ params }: Props) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle, 100);

  if (collection) {
    const products = collection.products.edges.map((e) => e.node).filter(p => !HIDDEN_HANDLES.includes(p.handle));
    return <CollectionPage products={products} title={collection.title} />;
  }

  // Use manual category map if available
  const allProducts = (await getAllProducts(100)).filter(p => !HIDDEN_HANDLES.includes(p.handle));
  const mappedHandles = CATEGORY_MAP[handle];
  const title = handle.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  if (mappedHandles) {
    const filtered = allProducts.filter(p => mappedHandles.includes(p.handle));
    return <CollectionPage products={filtered} title={title} />;
  }

  // Last resort: tag/title keyword match
  const keyword = handle.replace(/-/g, " ").toLowerCase();
  const filtered = allProducts.filter(p =>
    p.tags.some(t => t.toLowerCase().includes(keyword)) ||
    p.title.toLowerCase().includes(keyword)
  );
  return (
    <CollectionPage
      products={filtered.length > 0 ? filtered : allProducts}
      title={title}
    />
  );
}
