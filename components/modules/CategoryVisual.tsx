"use client";

import Image from "next/image";

interface CategoryVisualProps {
  icon: string;
  image?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-10 w-10", text: "text-xl", img: 40 },
  md: { box: "h-14 w-14", text: "text-2xl", img: 56 },
  lg: { box: "h-20 w-20", text: "text-4xl", img: 80 },
};

export default function CategoryVisual({
  icon,
  image,
  name,
  size = "md",
  className = "",
}: CategoryVisualProps) {
  const s = sizeMap[size];

  if (image) {
    return (
      <span
        className={`relative flex ${s.box} flex-shrink-0 overflow-hidden rounded-xl bg-brand-muted ${className}`}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes={`${s.img}px`}
        />
      </span>
    );
  }

  return (
    <span
      className={`flex ${s.box} flex-shrink-0 items-center justify-center rounded-xl bg-brand-muted ${s.text} ${className}`}
    >
      {icon || "📦"}
    </span>
  );
}
