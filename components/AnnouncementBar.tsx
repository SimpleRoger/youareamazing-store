"use client";

import { useEffect, useState } from "react";

function useCountry() {
  const [country, setCountry] = useState<string | null>(null);
  useEffect(() => {
    try {
      const cached = localStorage.getItem("visitor_country");
      if (cached) { setCountry(cached); return; }
    } catch {}
    fetch("https://ipapi.co/country/")
      .then(r => r.text())
      .then(c => {
        const code = c.trim();
        setCountry(code);
        try { localStorage.setItem("visitor_country", code); } catch {}
      })
      .catch(() => setCountry(null));
  }, []);
  return country;
}

function shippingLabel(country: string | null) {
  if (country === "AU") return "🇦🇺 Free Shipping";
  if (country === "US") return "🇺🇸 Ships to USA";
  if (country === "GB") return "🇬🇧 Ships to UK";
  if (country === "CA") return "🇨🇦 Ships to Canada";
  return "🌏 Worldwide Shipping";
}

export default function AnnouncementBar() {
  const country = useCountry();

  return (
    <div className="bg-black text-white text-[10px] text-center py-2 px-4 tracking-widest uppercase whitespace-nowrap overflow-hidden">
      {shippingLabel(country)}&nbsp; · &nbsp;2 items = 10% off&nbsp; · &nbsp;3+ items = 15% off
    </div>
  );
}
