"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

const obsidianItemActive = {
  background: "rgba(255,255,255,0.04)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.08)",
};

export function SlideButton({
  className,
  children,
  onClick,
  disabled,
  design = "void",
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  design?: "obsidian" | "void";
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 22, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.2;
    const distanceY = (e.clientY - centerY) * 0.2;
    x.set(distanceX);
    y.set(distanceY);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isObsidian = design === "obsidian";

  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, ...(isObsidian ? obsidianItemActive : {}) }}
      className={cn(
        "group w-fit px-8 py-4 flex items-center justify-center cursor-pointer relative overflow-hidden rounded-full font-semibold text-sm uppercase tracking-widest",
        "transition-shadow",
        design === "void" && "bg-zinc-950 text-white hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]",
        design === "obsidian" && "text-white/80 hover:text-white transition-colors duration-300",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span
        className={cn(
          "absolute inset-0 translate-y-[105%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] rounded-full",
          design === "void" && "bg-zinc-800",
          design === "obsidian" && "bg-white/[0.05]",
        )}
      />

      <motion.span className="relative z-10 transition-colors duration-300 ease-out">
        {children}
      </motion.span>
    </motion.button>
  );
}
