"use client";

import { useState } from "react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-[13px] uppercase tracking-widest font-medium mb-2">waitlist</h1>
      <p className="text-[12px] text-gray-500 mb-8">
        Be the first to know about new drops and restocks.
      </p>

      {submitted ? (
        <p className="text-[12px] text-black">you&apos;re on the list ✓</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 border border-gray-300 px-3 py-2 text-[12px] outline-none focus:border-black placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="border border-black px-4 py-2 text-[11px] uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors"
          >
            Join
          </button>
        </form>
      )}
    </div>
  );
}
