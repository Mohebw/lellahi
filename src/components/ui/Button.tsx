"use client";

import { forwardRef, useState, MouseEvent, ComponentPropsWithoutRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
type NativeButtonProps = ComponentPropsWithoutRef<"button">;
type SafeButtonProps = Omit<NativeButtonProps, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd">;
const MAX_TILT = 14;

interface ButtonProps extends SafeButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  tilt?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-mustard-400 text-ink-950 hover:bg-mustard-300 hover:shadow-glow-mustard font-semibold",
  secondary:
    "bg-white/5 border border-line text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md",
  ghost: "bg-transparent text-white hover:bg-white/5",
  danger: "bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25"
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, disabled, tilt = true, children, ...props },
    ref
  ) => {
    const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, y: 0, scale: 1 });
    const isTiltable = tilt && size !== "sm";

    function handleMouseMove(e: MouseEvent<HTMLButtonElement>) {
      if (!isTiltable) return;
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
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={transform}
        style={{ transformPerspective: 600 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, mass: 0.4 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors duration-200 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none will-change-transform",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
