"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Error</p>
      <h1 className="text-2xl font-black uppercase tracking-tight mb-4">Something went wrong</h1>
      <p className="text-gray-500 text-sm mb-2">{error.message}</p>
      {error.digest && <p className="text-gray-400 text-xs mb-8">Digest: {error.digest}</p>}
      <button onClick={reset} className="bg-black text-white text-sm font-medium uppercase tracking-widest px-8 py-4 hover:bg-gray-900 transition-colors">
        Try again
      </button>
    </div>
  );
}
