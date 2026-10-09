import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">404</p>
      <h1 className="text-3xl font-black uppercase tracking-tight mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block bg-black text-white text-sm font-medium uppercase tracking-widest px-8 py-4 hover:bg-gray-900 transition-colors"
      >
        Back to Shop
      </Link>
    </div>
  );
}
