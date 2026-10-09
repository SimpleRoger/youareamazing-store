"use client";

import { useState, useEffect, useRef } from "react";

const CM_MEASUREMENTS: Record<string, Record<string, number>> = {
  XS: { chest: 88, length: 67, shoulder: 42, sleeve: 59 },
  S:  { chest: 92, length: 69, shoulder: 44, sleeve: 60 },
  M:  { chest: 96, length: 71, shoulder: 46, sleeve: 61 },
  L:  { chest: 100, length: 73, shoulder: 48, sleeve: 62 },
  XL: { chest: 104, length: 75, shoulder: 50, sleeve: 63 },
  XXL:{ chest: 108, length: 77, shoulder: 52, sleeve: 64 },
};

const SIZE_CONV_ROWS = [
  { label: "International", values: ["XS","S","M","L","XL","XXL"] },
  { label: "AU / US",       values: ["4","6","8","10","12","14"] },
  { label: "EU",            values: ["34","36","38","40","42","44"] },
  { label: "UK",            values: ["6","8","10","12","14","16"] },
  { label: "Japan",         values: ["5","7","9","11","13","15"] },
];

const SIZES = ["XS","S","M","L","XL","XXL"];

const FIT_BRANDS: Record<string, Record<string, string>> = {
  "Supreme":  { XS:"XS", S:"S",  M:"M",  L:"L",  XL:"XL",  XXL:"XXL" },
  "Nike":     { XS:"XS", S:"S",  M:"M",  L:"L",  XL:"XL",  XXL:"XXL" },
  "Zara":     { XS:"XS", S:"S",  M:"M",  L:"L",  XL:"XL",  XXL:"XXL" },
  "H&M":      { XS:"XS", S:"S",  M:"M",  L:"L",  XL:"XL",  XXL:"XXL" },
  "Uniqlo":   { XS:"S",  S:"M",  M:"L",  L:"XL", XL:"XXL", XXL:"XXL" },
  "ASOS":     { XS:"XS", S:"S",  M:"M",  L:"L",  XL:"XL",  XXL:"XXL" },
  "Acne Studios": { XS:"XS", S:"S", M:"M", L:"L", XL:"XL", XXL:"XXL" },
};

function cm2in(v: number) { return (v / 2.54).toFixed(1); }

type MKey = "chest" | "length" | "shoulder" | "sleeve";

function TShirtDiagram({
  size, unit, hovered, setHovered,
}: {
  size: string; unit: "cm" | "in";
  hovered: MKey | null; setHovered: (k: MKey | null) => void;
}) {
  const m = CM_MEASUREMENTS[size] ?? CM_MEASUREMENTS["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} CM` : `${cm2in(v)}"`;

  const isH = (k: MKey) => hovered === k;
  const col = (k: MKey) => isH(k) ? "#000" : "#999";

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 300 280" className="w-full max-w-[280px] mx-auto" fill="none">
        {/* T-shirt outline */}
        <path
          d="M 110,18 C 95,22 82,38 80,58 L 30,75 L 10,135 L 48,148 L 55,105 L 55,255 L 245,255 L 245,105 L 252,148 L 290,135 L 270,75 L 220,58 C 218,38 205,22 190,18 Q 165,35 110,18 Z"
          stroke="#ccc" strokeWidth="1.5" fill="white"
        />

        {/* SHOULDER arrow */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => setHovered("shoulder")}
          onMouseLeave={() => setHovered(null)}
        >
          <line x1="80" y1="58" x2="220" y2="58" stroke={col("shoulder")} strokeWidth={isH("shoulder") ? 1.5 : 1} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="105" y="46" width="90" height="18" fill="white" />
          <text x="150" y="58" textAnchor="middle" fontSize="9" fill={col("shoulder")} fontFamily="sans-serif" fontWeight={isH("shoulder") ? "600" : "400"}>
            SHOULDER {isH("shoulder") ? `· ${fmt(m.shoulder)}` : "?"}
          </text>
        </g>

        {/* CHEST arrow */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => setHovered("chest")}
          onMouseLeave={() => setHovered(null)}
        >
          <line x1="55" y1="145" x2="245" y2="145" stroke={col("chest")} strokeWidth={isH("chest") ? 1.5 : 1} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="100" y="133" width="100" height="18" fill="white" />
          <text x="150" y="145" textAnchor="middle" fontSize="9" fill={col("chest")} fontFamily="sans-serif" fontWeight={isH("chest") ? "600" : "400"}>
            CHEST {isH("chest") ? `· ${fmt(m.chest)}` : "?"}
          </text>
        </g>

        {/* LENGTH arrow */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => setHovered("length")}
          onMouseLeave={() => setHovered(null)}
        >
          <line x1="30" y1="75" x2="30" y2="255" stroke={col("length")} strokeWidth={isH("length") ? 1.5 : 1} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="0" y="152" width="60" height="18" fill="white" />
          <text x="30" y="163" textAnchor="middle" fontSize="9" fill={col("length")} fontFamily="sans-serif" fontWeight={isH("length") ? "600" : "400"}>
            {isH("length") ? fmt(m.length) : "LENGTH ?"}
          </text>
        </g>

        {/* SLEEVE arrow */}
        <g
          className="cursor-pointer"
          onMouseEnter={() => setHovered("sleeve")}
          onMouseLeave={() => setHovered(null)}
        >
          <line x1="220" y1="58" x2="270" y2="105" stroke={col("sleeve")} strokeWidth={isH("sleeve") ? 1.5 : 1} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="240" y="68" width="58" height="18" fill="white" />
          <text x="269" y="80" textAnchor="middle" fontSize="9" fill={col("sleeve")} fontFamily="sans-serif" fontWeight={isH("sleeve") ? "600" : "400"}>
            {isH("sleeve") ? fmt(m.sleeve) : "SLEEVE ?"}
          </text>
        </g>

        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#999" />
          </marker>
        </defs>
      </svg>

      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-1">
        Measured flat across garment
      </p>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  defaultSize?: string;
}

export default function SizeGuideModal({ open, onClose, defaultSize = "M" }: Props) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [size, setSize] = useState(defaultSize);
  const [hovered, setHovered] = useState<MKey | null>(null);
  const [tab, setTab] = useState<"conversion" | "body">("conversion");
  const [fpBrand, setFpBrand] = useState("");
  const [fpSize, setFpSize] = useState("");
  const [fpResult, setFpResult] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSize(defaultSize); }, [defaultSize]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function predictFit() {
    if (!fpBrand || !fpSize) return;
    const map = FIT_BRANDS[fpBrand];
    if (map) setFpResult(map[fpSize] ?? "M");
  }

  if (!open) return null;

  const m = CM_MEASUREMENTS[size] ?? CM_MEASUREMENTS["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} cm` : `${cm2in(v)}"`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white w-full md:max-w-2xl md:rounded-none max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest">Size Guide</span>
          <button onClick={onClose} className="text-[11px] uppercase tracking-widest flex items-center gap-1.5 hover:opacity-60 transition-opacity">
            <span>✕</span> <span>Close</span>
          </button>
        </div>

        <div className="p-5 md:grid md:grid-cols-2 md:gap-8">
          {/* Left: Diagram */}
          <div>
            {/* Size selector for diagram */}
            <div className="flex gap-2 mb-4">
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`text-[11px] px-2.5 py-1 border transition-colors ${size === s ? "border-black bg-black text-white" : "border-gray-200 text-black hover:border-black"}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <TShirtDiagram size={size} unit={unit} hovered={hovered} setHovered={setHovered} />

            {/* Measurement cards */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {(["shoulder","chest","length","sleeve"] as MKey[]).map(k => (
                <div
                  key={k}
                  onMouseEnter={() => setHovered(k)}
                  onMouseLeave={() => setHovered(null)}
                  className={`border px-3 py-2 cursor-default transition-colors ${hovered === k ? "border-black" : "border-gray-100"}`}
                >
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">{k}</p>
                  <p className="text-[13px] font-medium mt-0.5">{fmt(m[k])}</p>
                </div>
              ))}
            </div>

            {/* CM / Inches toggle */}
            <div className="flex items-center gap-4 mt-4">
              {(["cm","in"] as const).map(u => (
                <label key={u} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio" name="unit" checked={unit === u}
                    onChange={() => setUnit(u)}
                    className="accent-black"
                  />
                  <span className="text-[11px] uppercase tracking-widest">{u === "cm" ? "CM" : "Inches"}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right: Tables + Fit predictor */}
          <div className="mt-6 md:mt-0">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-100 mb-4">
              {(["conversion","body"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-[11px] pb-2 uppercase tracking-widest transition-colors ${tab === t ? "border-b border-black font-medium" : "text-gray-400"}`}
                >
                  {t === "conversion" ? "Size Conversion" : "Body Measurements"}
                </button>
              ))}
            </div>

            {tab === "conversion" && (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr>
                      <td className="py-1.5 pr-3 text-gray-400 w-24" />
                      {SIZES.map(s => (
                        <td key={s} className={`py-1.5 px-2 text-center font-medium ${s === size ? "text-black" : "text-gray-400"}`}>{s}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CONV_ROWS.map(row => (
                      <tr key={row.label} className="border-t border-gray-50">
                        <td className="py-2 pr-3 text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">{row.label}</td>
                        {row.values.map((v, i) => (
                          <td key={i} className={`py-2 px-2 text-center ${SIZES[i] === size ? "font-semibold text-black" : "text-gray-600"}`}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "body" && (
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr>
                      <td className="py-1.5 pr-3 text-gray-400 w-24" />
                      {SIZES.map(s => (
                        <td key={s} className={`py-1.5 px-2 text-center font-medium ${s === size ? "text-black" : "text-gray-400"}`}>{s}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(["chest","shoulder","length"] as const).map(k => (
                      <tr key={k} className="border-t border-gray-50">
                        <td className="py-2 pr-3 text-gray-500 text-[10px] uppercase tracking-wider">{k}</td>
                        {SIZES.map(s => {
                          const val = CM_MEASUREMENTS[s]?.[k];
                          return (
                            <td key={s} className={`py-2 px-2 text-center ${s === size ? "font-semibold text-black" : "text-gray-600"}`}>
                              {val ? fmt(val) : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Fit Predictor */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3">Fit Predictor</p>
              <p className="text-[11px] text-gray-500 mb-3">Tell us what you wear in another brand</p>
              <div className="space-y-2">
                <select
                  value={fpBrand}
                  onChange={e => { setFpBrand(e.target.value); setFpResult(""); }}
                  className="w-full border border-gray-200 text-[12px] px-3 py-2.5 bg-white appearance-none"
                >
                  <option value="">Select a brand</option>
                  {Object.keys(FIT_BRANDS).map(b => <option key={b}>{b}</option>)}
                </select>
                <select
                  value={fpSize}
                  onChange={e => { setFpSize(e.target.value); setFpResult(""); }}
                  className="w-full border border-gray-200 text-[12px] px-3 py-2.5 bg-white appearance-none"
                >
                  <option value="">Select your size</option>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button
                  onClick={predictFit}
                  disabled={!fpBrand || !fpSize}
                  className="w-full py-2.5 text-[11px] uppercase tracking-widest font-medium border border-black bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white hover:text-black transition-colors"
                >
                  Find My Size
                </button>
              </div>
              {fpResult && (
                <div className="mt-3 border border-black p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">You are a</p>
                  <p className="text-2xl font-bold mt-1">{fpResult}</p>
                  <p className="text-[10px] text-gray-500 mt-1">in You Are Amazing</p>
                </div>
              )}
            </div>

            {/* Still unsure */}
            <div className="mt-6 border-t border-gray-100 pt-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest">Still unsure about your size?</p>
              <a href="/size-guide" className="block text-[11px] text-gray-500 hover:text-black transition-colors underline underline-offset-2">
                See full size chart
              </a>
              <a href="mailto:hello@youareamazing.lol" className="block text-[11px] text-gray-500 hover:text-black transition-colors underline underline-offset-2">
                Contact us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
