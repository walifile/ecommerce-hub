"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Blocks, Car, Palette, Sparkles } from "lucide-react";

const ICON_MAP = { Brain, Blocks, Car, Palette, Sparkles } as const;
type IconName = keyof typeof ICON_MAP;

interface CategoryCardProps {
  name: string;
  description: string;
  image: string;
  iconName: IconName;
  accent: string;
  index?: number;
}

export function CategoryCard({
  name,
  description,
  image,
  iconName,
  accent,
  index = 0,
}: CategoryCardProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[iconName];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href="/shop"
        className="group block overflow-hidden rounded-2xl border border-white/[0.07] bg-white/3 transition-all duration-300 hover:border-white/12 hover:-translate-y-1"
        style={{ boxShadow: hovered ? `0 8px 30px ${accent}28` : "none" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-4/3 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-linear-to-t from-[#07070f]/80 via-transparent to-transparent" />
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <h3 className="text-sm font-black text-white">{name}</h3>
            <p className="mt-1 text-xs leading-5 text-white/40">{description}</p>
          </div>
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${accent}18` }}
          >
            <Icon className="size-4" style={{ color: accent }} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
