"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring } from "motion/react";
export const HeaderToggle = ({
  open,
  onClick,
  className,
}: {
  open: boolean;
  onClick: () => void;
  className?: string;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 20, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  const lineTransition = {
    type: "spring",
    stiffness: 260,
    damping: 20,
  } as const;
  return (
    <motion.button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn(
        "text-white focus:outline-none p-4 rounded-full hover:bg-white/5 transition-colors",
        className,
      )}
      onClick={onClick}
    >
      <div className="w-6 flex flex-col items-end gap-1.5 pointer-events-none">
        <motion.span
          animate={{
            rotate: open ? 45 : 0,
            y: open ? 6 : 0,
          }}
          transition={lineTransition}
          className="block w-full h-0.5 bg-white origin-center rounded-full"
        />
        <motion.span
          animate={{ opacity: open ? 0 : 1, x: open ? -10 : 0 }}
          transition={lineTransition}
          className="block w-2/3 h-0.5 bg-white rounded-full"
        />
        <motion.span
          animate={{
            rotate: open ? -45 : 0,
            y: open ? -8 : 0,
            width: open ? "100%" : "50%",
          }}
          transition={lineTransition}
          className="block w-1/2 h-0.5 bg-white origin-center rounded-full"
        />
      </div>
    </motion.button>
  );
};
