"use client";

import { useState, useEffect, useRef } from "react";

// ── Product categories ────────────────────────────────────────────────────────

export type ProductCategory = "tops" | "bottoms" | "hats" | "underwear" | "outerwear";

export function detectCategory(handle: string, tags: string[]): ProductCategory {
  const all = [handle, ...tags].join(" ").toLowerCase();
  if (/pant|short|jogger|trouser|bottom/.test(all)) return "bottoms";
  if (/hat|cap|beanie|bucket/.test(all)) return "hats";
  if (/underwear|boxer|brief|trunk/.test(all)) return "underwear";
  if (/jacket|coat|hoodie|zip.?up|cardigan|blazer|outerwear|puffer|windbreaker|fur/.test(all)) return "outerwear";
  return "tops";
}

// ── Measurements per category ─────────────────────────────────────────────────

type TopsKey      = "chest" | "length" | "shoulder" | "sleeve";
type BottomsKey   = "waist" | "hip" | "inseam" | "length";
type HatsKey      = "circumference";
type UnderwearKey = "waist" | "hip";

type MeasurementKey = TopsKey | BottomsKey | HatsKey | UnderwearKey;

const TOPS_CM: Record<string, Record<TopsKey, number>> = {
  S:  { chest: 92,  length: 68, shoulder: 42, sleeve: 60 },
  M:  { chest: 98,  length: 71, shoulder: 44, sleeve: 61 },
  L:  { chest: 104, length: 74, shoulder: 46, sleeve: 62 },
  XL: { chest: 110, length: 77, shoulder: 48, sleeve: 63 },
};

const OUTERWEAR_CM: Record<string, Record<TopsKey, number>> = {
  S:  { chest: 98,  length: 72, shoulder: 44, sleeve: 63 },
  M:  { chest: 104, length: 75, shoulder: 46, sleeve: 64 },
  L:  { chest: 110, length: 78, shoulder: 48, sleeve: 65 },
  XL: { chest: 116, length: 81, shoulder: 50, sleeve: 66 },
};

const BOTTOMS_CM: Record<string, Record<BottomsKey, number>> = {
  S:  { waist: 74, hip: 94,  inseam: 76, length: 100 },
  M:  { waist: 78, hip: 98,  inseam: 77, length: 101 },
  L:  { waist: 82, hip: 102, inseam: 78, length: 102 },
  XL: { waist: 86, hip: 106, inseam: 79, length: 103 },
};

const HATS_CM: Record<string, Record<HatsKey, number>> = {
  S:  { circumference: 55 },
  M:  { circumference: 57 },
  L:  { circumference: 59 },
  XL: { circumference: 61 },
};

const UNDERWEAR_CM: Record<string, Record<UnderwearKey, number>> = {
  S:  { waist: 72, hip: 90 },
  M:  { waist: 76, hip: 94 },
  L:  { waist: 80, hip: 98 },
  XL: { waist: 84, hip: 102 },
};

const SIZE_CONV: Record<ProductCategory, { label: string; values: string[] }[]> = {
  tops: [
    { label: "International", values: ["S","M","L","XL"] },
    { label: "AU / US",       values: ["6","8","10","12"] },
    { label: "EU",            values: ["36","38","40","42"] },
    { label: "UK",            values: ["8","10","12","14"] },
    { label: "Japan",         values: ["7","9","11","13"] },
  ],
  outerwear: [
    { label: "International", values: ["S","M","L","XL"] },
    { label: "AU / US",       values: ["8","10","12","14"] },
    { label: "EU",            values: ["38","40","42","44"] },
    { label: "UK",            values: ["10","12","14","16"] },
    { label: "Japan",         values: ["9","11","13","15"] },
  ],
  bottoms: [
    { label: "International", values: ["S","M","L","XL"] },
    { label: "AU / US Waist", values: ["28–30","30–32","32–34","34–36"] },
    { label: "EU",            values: ["44–46","46–48","48–50","50–52"] },
    { label: "UK",            values: ["28–30","30–32","32–34","34–36"] },
  ],
  hats: [
    { label: "International",    values: ["S","M","L","XL"] },
    { label: "Head (cm)",        values: ["55","57","59","61"] },
    { label: "Head (inches)",    values: ['21½','22½','23¼','24'] },
    { label: "AU / US fitted",   values: ["6⅞","7","7⅛","7⅜"] },
  ],
  underwear: [
    { label: "International", values: ["S","M","L","XL"] },
    { label: "AU / US Waist", values: ["28–30","30–32","32–34","34–36"] },
    { label: "EU",            values: ["4","5","6","7"] },
    { label: "UK",            values: ["28–30","30–32","32–34","34–36"] },
  ],
};

const FIT_BRANDS: Record<string, Record<string, string>> = {
  "Supreme":      { S:"S", M:"M", L:"L", XL:"XL" },
  "Nike":         { S:"S", M:"M", L:"L", XL:"XL" },
  "Zara":         { S:"S", M:"M", L:"L", XL:"XL" },
  "H&M":          { S:"S", M:"M", L:"L", XL:"XL" },
  "Uniqlo":       { S:"M", M:"L", L:"XL", XL:"XL" },
  "ASOS":         { S:"S", M:"M", L:"L", XL:"XL" },
  "Acne Studios": { S:"S", M:"M", L:"L", XL:"XL" },
};

const SIZES = ["S","M","L","XL"];

function cm2in(v: number) { return (v / 2.54).toFixed(1); }

// ── Diagrams ──────────────────────────────────────────────────────────────────

function TopsDiagram({ size, unit, hovered, setHovered }: DiagramProps) {
  const m = TOPS_CM[size] ?? TOPS_CM["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} CM` : `${cm2in(v)}"`;
  const col = (k: MeasurementKey) => hovered === k ? "#000" : "#999";
  const w   = (k: MeasurementKey) => hovered === k ? 1.5 : 1;

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 300 280" className="w-full max-w-[280px] mx-auto" fill="none">
        <path d="M 110,18 C 95,22 82,38 80,58 L 30,75 L 10,135 L 48,148 L 55,105 L 55,255 L 245,255 L 245,105 L 252,148 L 290,135 L 270,75 L 220,58 C 218,38 205,22 190,18 Q 165,35 110,18 Z"
          stroke="#ccc" strokeWidth="1.5" fill="white" />
        <g className="cursor-pointer" onMouseEnter={() => setHovered("shoulder")} onMouseLeave={() => setHovered(null)}>
          <line x1="80" y1="58" x2="220" y2="58" stroke={col("shoulder")} strokeWidth={w("shoulder")} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="105" y="46" width="90" height="18" fill="white" />
          <text x="150" y="58" textAnchor="middle" fontSize="9" fill={col("shoulder")} fontFamily="sans-serif" fontWeight={hovered==="shoulder" ? "600" : "400"}>
            SHOULDER {hovered==="shoulder" ? `· ${fmt(m.shoulder)}` : "?"}
          </text>
        </g>
        <g className="cursor-pointer" onMouseEnter={() => setHovered("chest")} onMouseLeave={() => setHovered(null)}>
          <line x1="55" y1="145" x2="245" y2="145" stroke={col("chest")} strokeWidth={w("chest")} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="100" y="133" width="100" height="18" fill="white" />
          <text x="150" y="145" textAnchor="middle" fontSize="9" fill={col("chest")} fontFamily="sans-serif" fontWeight={hovered==="chest" ? "600" : "400"}>
            CHEST {hovered==="chest" ? `· ${fmt(m.chest)}` : "?"}
          </text>
        </g>
        <g className="cursor-pointer" onMouseEnter={() => setHovered("length")} onMouseLeave={() => setHovered(null)}>
          <line x1="30" y1="75" x2="30" y2="255" stroke={col("length")} strokeWidth={w("length")} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="0" y="152" width="60" height="18" fill="white" />
          <text x="30" y="163" textAnchor="middle" fontSize="9" fill={col("length")} fontFamily="sans-serif" fontWeight={hovered==="length" ? "600" : "400"}>
            {hovered==="length" ? fmt(m.length) : "LENGTH ?"}
          </text>
        </g>
        <g className="cursor-pointer" onMouseEnter={() => setHovered("sleeve")} onMouseLeave={() => setHovered(null)}>
          <line x1="220" y1="58" x2="270" y2="105" stroke={col("sleeve")} strokeWidth={w("sleeve")} markerEnd="url(#arr)" markerStart="url(#arr)" />
          <rect x="240" y="68" width="58" height="18" fill="white" />
          <text x="269" y="80" textAnchor="middle" fontSize="9" fill={col("sleeve")} fontFamily="sans-serif" fontWeight={hovered==="sleeve" ? "600" : "400"}>
            {hovered==="sleeve" ? fmt(m.sleeve) : "SLEEVE ?"}
          </text>
        </g>
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#999" />
          </marker>
        </defs>
      </svg>
      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-1">Measured flat across garment</p>
    </div>
  );
}

function BottomsDiagram({ size, unit, hovered, setHovered }: DiagramProps) {
  const m = BOTTOMS_CM[size] ?? BOTTOMS_CM["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} CM` : `${cm2in(v)}"`;
  const col = (k: MeasurementKey) => hovered === k ? "#000" : "#999";
  const w   = (k: MeasurementKey) => hovered === k ? 1.5 : 1;

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 300 320" className="w-full max-w-[260px] mx-auto" fill="none">
        {/* Pants outline — two legs joined at waist, smooth crotch curve */}
        <path d="M 72,22 L 228,22 Q 252,75 252,115 L 252,295 L 185,295 L 185,158 Q 150,185 115,158 L 115,295 L 48,295 L 48,115 Q 48,75 72,22 Z"
          stroke="#ccc" strokeWidth="1.5" fill="white" />

        {/* WAIST */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("waist")} onMouseLeave={() => setHovered(null)}>
          <line x1="72" y1="22" x2="228" y2="22" stroke={col("waist")} strokeWidth={w("waist")} markerEnd="url(#arrb)" markerStart="url(#arrb)" />
          <rect x="102" y="10" width="96" height="16" fill="white" />
          <text x="150" y="21" textAnchor="middle" fontSize="9" fill={col("waist")} fontFamily="sans-serif" fontWeight={hovered==="waist" ? "600" : "400"}>
            WAIST {hovered==="waist" ? `· ${fmt(m.waist)}` : "?"}
          </text>
        </g>

        {/* HIP */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("hip")} onMouseLeave={() => setHovered(null)}>
          <line x1="48" y1="115" x2="252" y2="115" stroke={col("hip")} strokeWidth={w("hip")} markerEnd="url(#arrb)" markerStart="url(#arrb)" />
          <rect x="102" y="103" width="96" height="16" fill="white" />
          <text x="150" y="114" textAnchor="middle" fontSize="9" fill={col("hip")} fontFamily="sans-serif" fontWeight={hovered==="hip" ? "600" : "400"}>
            HIP {hovered==="hip" ? `· ${fmt(m.hip)}` : "?"}
          </text>
        </g>

        {/* INSEAM — dashed from crotch to hem between legs */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("inseam")} onMouseLeave={() => setHovered(null)}>
          <line x1="150" y1="174" x2="150" y2="295" stroke={col("inseam")} strokeWidth={w("inseam")} markerEnd="url(#arrb)" markerStart="url(#arrb)" strokeDasharray="4 2" />
          <rect x="108" y="218" width="84" height="16" fill="white" />
          <text x="150" y="229" textAnchor="middle" fontSize="9" fill={col("inseam")} fontFamily="sans-serif" fontWeight={hovered==="inseam" ? "600" : "400"}>
            INSEAM {hovered==="inseam" ? `· ${fmt(m.inseam)}` : "?"}
          </text>
        </g>

        {/* LENGTH */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("length")} onMouseLeave={() => setHovered(null)}>
          <line x1="25" y1="22" x2="25" y2="295" stroke={col("length")} strokeWidth={w("length")} markerEnd="url(#arrb)" markerStart="url(#arrb)" />
          <rect x="0" y="148" width="50" height="16" fill="white" />
          <text x="25" y="159" textAnchor="middle" fontSize="9" fill={col("length")} fontFamily="sans-serif" fontWeight={hovered==="length" ? "600" : "400"}>
            {hovered==="length" ? fmt(m.length) : "LENGTH ?"}
          </text>
        </g>

        <defs>
          <marker id="arrb" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#999" />
          </marker>
        </defs>
      </svg>
      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-1">Measured flat across garment</p>
    </div>
  );
}

function OuterwearDiagram({ size, unit, hovered, setHovered }: DiagramProps) {
  const m = OUTERWEAR_CM[size] ?? OUTERWEAR_CM["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} CM` : `${cm2in(v)}"`;
  const col = (k: MeasurementKey) => hovered === k ? "#000" : "#999";
  const w   = (k: MeasurementKey) => hovered === k ? 1.5 : 1;

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 300 290" className="w-full max-w-[280px] mx-auto" fill="none">
        {/* Hood */}
        <path d="M 112,24 Q 150,4 188,24 Q 168,42 132,42 Q 120,42 112,24 Z"
          stroke="#ccc" strokeWidth="1.5" fill="#f0f0f0" />
        {/* Jacket body with dropped shoulders and cuffs */}
        <path d="M 112,24 C 96,28 84,44 82,65 L 28,80 L 8,142 L 50,154 L 58,110 L 58,262 L 242,262 L 242,110 L 250,154 L 292,142 L 272,80 L 218,65 C 216,44 204,28 188,24 Q 168,42 132,42 Q 120,42 112,24 Z"
          stroke="#ccc" strokeWidth="1.5" fill="white" />
        {/* Center zip line */}
        <line x1="150" y1="42" x2="150" y2="262" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4 3" />
        {/* Cuff lines — left sleeve */}
        <line x1="8" y1="142" x2="50" y2="154" stroke="#ddd" strokeWidth="1" />
        {/* Cuff lines — right sleeve */}
        <line x1="250" y1="154" x2="292" y2="142" stroke="#ddd" strokeWidth="1" />

        {/* SHOULDER */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("shoulder")} onMouseLeave={() => setHovered(null)}>
          <line x1="82" y1="65" x2="218" y2="65" stroke={col("shoulder")} strokeWidth={w("shoulder")} markerEnd="url(#arro)" markerStart="url(#arro)" />
          <rect x="105" y="53" width="90" height="16" fill="white" />
          <text x="150" y="64" textAnchor="middle" fontSize="9" fill={col("shoulder")} fontFamily="sans-serif" fontWeight={hovered==="shoulder" ? "600" : "400"}>
            SHOULDER {hovered==="shoulder" ? `· ${fmt(m.shoulder)}` : "?"}
          </text>
        </g>

        {/* CHEST */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("chest")} onMouseLeave={() => setHovered(null)}>
          <line x1="58" y1="150" x2="242" y2="150" stroke={col("chest")} strokeWidth={w("chest")} markerEnd="url(#arro)" markerStart="url(#arro)" />
          <rect x="100" y="138" width="100" height="16" fill="white" />
          <text x="150" y="149" textAnchor="middle" fontSize="9" fill={col("chest")} fontFamily="sans-serif" fontWeight={hovered==="chest" ? "600" : "400"}>
            CHEST {hovered==="chest" ? `· ${fmt(m.chest)}` : "?"}
          </text>
        </g>

        {/* LENGTH */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("length")} onMouseLeave={() => setHovered(null)}>
          <line x1="28" y1="80" x2="28" y2="262" stroke={col("length")} strokeWidth={w("length")} markerEnd="url(#arro)" markerStart="url(#arro)" />
          <rect x="0" y="158" width="56" height="16" fill="white" />
          <text x="28" y="169" textAnchor="middle" fontSize="9" fill={col("length")} fontFamily="sans-serif" fontWeight={hovered==="length" ? "600" : "400"}>
            {hovered==="length" ? fmt(m.length) : "LENGTH ?"}
          </text>
        </g>

        {/* SLEEVE */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("sleeve")} onMouseLeave={() => setHovered(null)}>
          <line x1="218" y1="65" x2="272" y2="80" stroke={col("sleeve")} strokeWidth={w("sleeve")} markerEnd="url(#arro)" markerStart="url(#arro)" />
          <rect x="234" y="60" width="56" height="16" fill="white" />
          <text x="262" y="71" textAnchor="middle" fontSize="9" fill={col("sleeve")} fontFamily="sans-serif" fontWeight={hovered==="sleeve" ? "600" : "400"}>
            {hovered==="sleeve" ? fmt(m.sleeve) : "SLEEVE ?"}
          </text>
        </g>

        <defs>
          <marker id="arro" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#999" />
          </marker>
        </defs>
      </svg>
      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-1">Measured flat across garment</p>
    </div>
  );
}

function HatsDiagram({ size, unit, hovered, setHovered }: DiagramProps) {
  const m = HATS_CM[size] ?? HATS_CM["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} CM` : `${cm2in(v)}"`;
  const col = (k: MeasurementKey) => hovered === k ? "#000" : "#999";

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 300 220" className="w-full max-w-[260px] mx-auto" fill="none">
        {/* Head circle */}
        <ellipse cx="150" cy="120" rx="95" ry="80" stroke="#ccc" strokeWidth="1.5" fill="white" />
        {/* Brim */}
        <rect x="40" y="80" width="220" height="18" rx="4" stroke="#ccc" strokeWidth="1.5" fill="white" />
        {/* Crown */}
        <path d="M 80,80 Q 150,10 220,80" stroke="#ccc" strokeWidth="1.5" fill="white" />

        {/* CIRCUMFERENCE arc label */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("circumference")} onMouseLeave={() => setHovered(null)}>
          <ellipse cx="150" cy="120" rx="95" ry="80" stroke={col("circumference")} strokeWidth={hovered==="circumference" ? 1.5 : 1} strokeDasharray="6 3" fill="none" />
          <rect x="82" y="155" width="136" height="16" fill="white" />
          <text x="150" y="166" textAnchor="middle" fontSize="9" fill={col("circumference")} fontFamily="sans-serif" fontWeight={hovered==="circumference" ? "600" : "400"}>
            CIRCUMFERENCE {hovered==="circumference" ? `· ${fmt(m.circumference)}` : "?"}
          </text>
        </g>
      </svg>
      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-1">Measure around your head, 1cm above ears</p>
    </div>
  );
}

function UnderwearDiagram({ size, unit, hovered, setHovered }: DiagramProps) {
  const m = UNDERWEAR_CM[size] ?? UNDERWEAR_CM["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} CM` : `${cm2in(v)}"`;
  const col = (k: MeasurementKey) => hovered === k ? "#000" : "#999";
  const w   = (k: MeasurementKey) => hovered === k ? 1.5 : 1;

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 300 240" className="w-full max-w-[240px] mx-auto" fill="none">
        {/* Brief outline */}
        <path d="M 60,20 L 240,20 L 230,100 Q 200,140 150,100 Q 100,140 70,100 Z"
          stroke="#ccc" strokeWidth="1.5" fill="white" />
        <path d="M 70,100 Q 60,170 60,210 L 110,210 Q 120,140 150,100" stroke="#ccc" strokeWidth="1.5" fill="white" />
        <path d="M 230,100 Q 240,170 240,210 L 190,210 Q 180,140 150,100" stroke="#ccc" strokeWidth="1.5" fill="white" />

        {/* WAIST */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("waist")} onMouseLeave={() => setHovered(null)}>
          <line x1="60" y1="20" x2="240" y2="20" stroke={col("waist")} strokeWidth={w("waist")} markerEnd="url(#arru)" markerStart="url(#arru)" />
          <rect x="100" y="8" width="100" height="16" fill="white" />
          <text x="150" y="19" textAnchor="middle" fontSize="9" fill={col("waist")} fontFamily="sans-serif" fontWeight={hovered==="waist" ? "600" : "400"}>
            WAIST {hovered==="waist" ? `· ${fmt(m.waist)}` : "?"}
          </text>
        </g>

        {/* HIP */}
        <g className="cursor-pointer" onMouseEnter={() => setHovered("hip")} onMouseLeave={() => setHovered(null)}>
          <line x1="62" y1="75" x2="238" y2="75" stroke={col("hip")} strokeWidth={w("hip")} markerEnd="url(#arru)" markerStart="url(#arru)" />
          <rect x="100" y="63" width="100" height="16" fill="white" />
          <text x="150" y="74" textAnchor="middle" fontSize="9" fill={col("hip")} fontFamily="sans-serif" fontWeight={hovered==="hip" ? "600" : "400"}>
            HIP {hovered==="hip" ? `· ${fmt(m.hip)}` : "?"}
          </text>
        </g>

        <defs>
          <marker id="arru" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#999" />
          </marker>
        </defs>
      </svg>
      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-1">Measured flat across garment</p>
    </div>
  );
}

// ── Shared diagram props ──────────────────────────────────────────────────────

interface DiagramProps {
  size: string;
  unit: "cm" | "in";
  hovered: MeasurementKey | null;
  setHovered: (k: MeasurementKey | null) => void;
}

// ── Per-category measurement card config ──────────────────────────────────────

const CATEGORY_FIELDS: Record<ProductCategory, { keys: MeasurementKey[]; data: Record<string, Record<string, number>> }> = {
  tops:      { keys: ["shoulder","chest","length","sleeve"], data: TOPS_CM },
  outerwear: { keys: ["shoulder","chest","length","sleeve"], data: OUTERWEAR_CM },
  bottoms:   { keys: ["waist","hip","inseam","length"],      data: BOTTOMS_CM },
  hats:      { keys: ["circumference"],                      data: HATS_CM },
  underwear: { keys: ["waist","hip"],                        data: UNDERWEAR_CM },
};

// ── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  defaultSize?: string;
  productCategory?: ProductCategory;
}

export default function SizeGuideModal({ open, onClose, defaultSize = "M", productCategory = "tops" }: Props) {
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [size, setSize] = useState(defaultSize);
  const [hovered, setHovered] = useState<MeasurementKey | null>(null);
  const [tab, setTab] = useState<"conversion" | "body">("conversion");
  const [fpBrand, setFpBrand] = useState("");
  const [fpSize, setFpSize] = useState("");
  const [fpResult, setFpResult] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSize(defaultSize); }, [defaultSize]);
  useEffect(() => { setHovered(null); }, [productCategory]);

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

  const { keys, data } = CATEGORY_FIELDS[productCategory];
  const m = data[size] ?? data["M"];
  const fmt = (v: number) => unit === "cm" ? `${v} cm` : `${cm2in(v)}"`;
  const convRows = SIZE_CONV[productCategory];

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

            {productCategory === "tops"      && <TopsDiagram      size={size} unit={unit} hovered={hovered} setHovered={setHovered} />}
            {productCategory === "outerwear" && <OuterwearDiagram size={size} unit={unit} hovered={hovered} setHovered={setHovered} />}
            {productCategory === "bottoms"   && <BottomsDiagram   size={size} unit={unit} hovered={hovered} setHovered={setHovered} />}
            {productCategory === "hats"      && <HatsDiagram      size={size} unit={unit} hovered={hovered} setHovered={setHovered} />}
            {productCategory === "underwear" && <UnderwearDiagram size={size} unit={unit} hovered={hovered} setHovered={setHovered} />}

            {/* Measurement cards */}
            <div className={`grid gap-2 mt-4 ${keys.length <= 2 ? "grid-cols-2" : "grid-cols-2"}`}>
              {keys.map(k => (
                <div
                  key={k}
                  onMouseEnter={() => setHovered(k)}
                  onMouseLeave={() => setHovered(null)}
                  className={`border px-3 py-2 cursor-default transition-colors ${hovered === k ? "border-black" : "border-gray-100"}`}
                >
                  <p className="text-[9px] uppercase tracking-widest text-gray-400">{k}</p>
                  <p className="text-[13px] font-medium mt-0.5">{fmt((m as Record<string, number>)[k])}</p>
                </div>
              ))}
            </div>

            {/* CM / Inches toggle */}
            <div className="flex items-center gap-4 mt-4">
              {(["cm","in"] as const).map(u => (
                <label key={u} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="unit" checked={unit === u} onChange={() => setUnit(u)} className="accent-black" />
                  <span className="text-[11px] uppercase tracking-widest">{u === "cm" ? "CM" : "Inches"}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right: Tables + Fit predictor */}
          <div className="mt-6 md:mt-0">
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
                    {convRows.map(row => (
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
                    {keys.map(k => (
                      <tr key={k} className="border-t border-gray-50">
                        <td className="py-2 pr-3 text-gray-500 text-[10px] uppercase tracking-wider">{k}</td>
                        {SIZES.map(s => {
                          const val = (data[s] as Record<string, number>)?.[k];
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

            {/* Fit Predictor — tops and outerwear */}
            {(productCategory === "tops" || productCategory === "outerwear") && (
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
            )}

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
