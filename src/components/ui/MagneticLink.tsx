"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, MouseEvent } from "react";
import { cn } from "@/lib/utils";

const MotionLink = motion(Link);
const MAX_TILT = 14;

export function MagneticLink({
  href,
  className,
  children
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, y: 0, scale: 1 });

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform({
      rotateY: px * MAX_TILT * 2,
      rotateX: -py * MAX_TILT * 2,
      y: -4,
      scale: 1.03
    });
  }

  function handleMouseLeave() {
    setTransform({ rotateX: 0, rotateY: 0, y: 0, scale: 1 });
  }

  return (
    <MotionLink
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={transform}
      style={{ transformPerspective: 600 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.4 }}
      className={cn("inline-flex will-change-transform", className)}
    >
      {children}
    </MotionLink>
  );
}
