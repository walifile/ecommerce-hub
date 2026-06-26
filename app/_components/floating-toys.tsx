"use client";

import { Blocks, Gamepad2, Sparkles, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";

const toys = [
  {
    icon: Blocks,
    className: "left-0 top-10",
    accent: "var(--brand)",
    duration: 4.6,
  },
  {
    icon: Sparkles,
    className: "right-10 top-0",
    accent: "var(--brand-2)",
    duration: 5.4,
  },
  {
    icon: Gamepad2,
    className: "left-10 bottom-6",
    accent: "var(--brand-3)",
    duration: 4.9,
  },
  {
    icon: WandSparkles,
    className: "right-0 bottom-12",
    accent: "var(--brand)",
    duration: 5.8,
  },
];

export function FloatingToys() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {toys.map((toy) => {
        const Icon = toy.icon;
        return (
          <motion.div
            key={toy.className}
            className={`absolute flex size-14 items-center justify-center rounded-2xl border border-white/8 backdrop-blur-sm ${toy.className}`}
            style={{
              background: `color-mix(in srgb, ${toy.accent} 8%, transparent)`,
              boxShadow: `0 8px 32px color-mix(in srgb, ${toy.accent} 13%, transparent)`,
            }}
            animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
            transition={{
              duration: toy.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Icon className="size-6" style={{ color: toy.accent }} />
          </motion.div>
        );
      })}
    </div>
  );
}
