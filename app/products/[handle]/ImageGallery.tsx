"use client";

import { useState } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/types/shopify";
import { ChevronLeft, ChevronRight } from "@/components/Icons";

interface ImageGalleryProps {
  images: ShopifyImage[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      {/* Main image */}
      <div className="relative flex-1 aspect-[3/4] bg-gray-50 overflow-hidden">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].altText ?? title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
        {/* Arrow controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() =>
                setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] lg:w-20">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-16 lg:w-full aspect-square border-2 overflow-hidden transition-colors ${
                i === activeIndex ? "border-black" : "border-transparent"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
