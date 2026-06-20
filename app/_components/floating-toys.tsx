"use client";

import { Blocks, Gamepad2, Sparkles, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";

const toys = [
  {
    icon: Blocks,
    className: "left-0 top-10 bg-[#eef4ff] text-[#4b74ff]",
    duration: 4.6,
  },
  {
    icon: Sparkles,
    className: "right-10 top-0 bg-[#fff7cf] text-[#d89a00]",
    duration: 5.4,
  },
  {
    icon: Gamepad2,
    className: "left-10 bottom-6 bg-[#f1e9ff] text-[#7c51e6]",
    duration: 4.9,
  },
  {
    icon: WandSparkles,
    className: "right-0 bottom-12 bg-[#e9fbff] text-[#1596b5]",
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
            className={`absolute flex size-14 items-center justify-center rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${toy.className}`}
            animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
            transition={{
              duration: toy.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Icon className="size-6" />
          </motion.div>
        );
      })}
    </div>
  );
}
