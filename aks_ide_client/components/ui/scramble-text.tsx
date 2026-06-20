"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
export const ScrambleText = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rafRef = useRef<number | null>(null);
  const scramble = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let iterations = 0;
    const max = text.length * 3;
    const tick = () => {
      setDisplay(
        text
          .split("")
          .map((char, i) =>
            i < Math.floor(iterations / 3)
              ? char
              : chars[Math.floor(Math.random() * chars.length)],
          )
          .join(""),
      );
      iterations++;
      if (iterations < max) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(text);
    };
    rafRef.current = requestAnimationFrame(tick);
  };
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );
  return (
    <span
      className={cn("font-mono tracking-widest", className)}
      onMouseEnter={scramble}
    >
      {display}
    </span>
  );
};
