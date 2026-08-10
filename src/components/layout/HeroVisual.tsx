"use client";

import { motion } from "framer-motion";

// Coordinates approximate the dot layout of the Lellahi "L" logo,
// reused here as an ambient, connecting circuit — the site's signature motif.
const DOTS = [
  [40, 10], [70, 10],
  [10, 30],
  [40, 40], [70, 40],
  [40, 70], [70, 70],
  [62, 90],
  [40, 100], [70, 100], [100, 100], [130, 100], [160, 100],
  [40, 130], [70, 130], [100, 130], [130, 130], [160, 130],
  [190, 130],
  [18, 145],
  [172, 190]
];

const LINES: [number, number][][] = [
  [[40, 10], [70, 40]],
  [[70, 40], [40, 70]],
  [[40, 70], [70, 100]],
  [[70, 100], [100, 130]],
  [[100, 130], [130, 100]],
  [[130, 100], [160, 130]],
  [[160, 130], [190, 130]]
];

export function HeroVisual() {
  return (
    <div className="relative aspect-square w-full max-w-md mx-auto">
      <svg viewBox="0 0 210 210" className="h-full w-full" aria-hidden>
        {LINES.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={a[0] + 5}
            y1={a[1] + 5}
            x2={b[0] + 5}
            y2={b[1] + 5}
            stroke="#FCCF04"
            strokeWidth="2"
            strokeOpacity="0.35"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.35 }}
            transition={{ duration: 1, delay: 0.5 + i * 0.08, ease: "easeOut" }}
          />
        ))}
        {DOTS.map(([x, y], i) => (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width="10"
            height="10"
            rx="2.5"
            fill="#FCCF04"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: "backOut" }}
            style={{ transformOrigin: `${x + 5}px ${y + 5}px` }}
          />
        ))}
      </svg>
      <motion.div
        className="absolute inset-0 -z-10 rounded-full bg-mustard-400/10 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
