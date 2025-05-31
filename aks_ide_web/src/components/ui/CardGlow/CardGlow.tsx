import React, { memo, useCallback, useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import { cn } from "../lib/utils";
import useTheme from "../lib/useTheme";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

interface CardGlowProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  glow?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const CardGlow = memo(
  ({
    children,
    className,
    disabled = false,
    variant = "default",
    scale = "lg",
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    glow = true,
    movementDuration = 2,
    borderWidth = 1,
  }: CardGlowProps) => {
    const { theme } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current || disabled) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          const targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration, disabled]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    // Create gradient based on theme colors
    const createGradient = () => {
      return `radial-gradient(circle, ${theme.primaryColor}40 10%, ${theme.primaryColor}00 20%),
        radial-gradient(circle at 40% 40%, ${theme.accentColor}30 5%, ${theme.accentColor}00 15%),
        radial-gradient(circle at 60% 60%, ${theme.successColor}40 10%, ${theme.successColor}00 20%), 
        radial-gradient(circle at 40% 60%, ${theme.infoColor}40 10%, ${theme.infoColor}00 20%),
        repeating-conic-gradient(
          from 236.84deg at 50% 50%,
          ${theme.primaryColor} 0%,
          ${theme.accentColor} calc(25% / 5),
          ${theme.successColor} calc(50% / 5), 
          ${theme.infoColor} calc(75% / 5),
          ${theme.primaryColor} calc(100% / 5)
        )`;
    };

    // Render based on design variant and scale
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <motion.div
                className={cn("relative", className)}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Static border for disabled state */}
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded-md border opacity-0 transition-opacity",
                    glow && disabled && "opacity-100"
                  )}
                  style={{
                    borderColor: `${theme.secondaryColor}40`,
                  }}
                />

                {/* Animated glow effect */}
                <div
                  ref={containerRef}
                  style={
                    {
                      "--blur": `${blur}px`,
                      "--spread": spread,
                      "--start": "0",
                      "--active": "0",
                      "--glowingeffect-border-width": `${borderWidth}px`,
                      "--gradient": createGradient(),
                    } as React.CSSProperties
                  }
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-md opacity-100 transition-opacity",
                    glow && !disabled && "opacity-100",
                    blur > 0 && "blur-[var(--blur)]",
                    disabled && "!hidden"
                  )}
                >
                  <div
                    className={cn(
                      "glow rounded-md",
                      'after:content-[""] after:rounded-md after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
                      "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
                      "after:[background:var(--gradient)] after:[background-attachment:fixed]",
                      "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
                      "after:[mask-clip:padding-box,border-box]",
                      "after:[mask-composite:intersect]",
                      "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
                    )}
                  />
                </div>

                {/* Content container */}
                <div
                  className="relative z-10 p-3 rounded-md"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                    border: `1px solid ${theme.secondaryColor}40`,
                  }}
                >
                  {children}
                </div>
              </motion.div>
            );

          case "lg":
            return (
              <motion.div
                className={cn("relative", className)}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Static border for disabled state */}
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded-lg border opacity-0 transition-opacity",
                    glow && disabled && "opacity-100"
                  )}
                  style={{
                    borderColor: `${theme.secondaryColor}40`,
                  }}
                />

                {/* Animated glow effect */}
                <div
                  ref={containerRef}
                  style={
                    {
                      "--blur": `${blur}px`,
                      "--spread": spread,
                      "--start": "0",
                      "--active": "0",
                      "--glowingeffect-border-width": `${borderWidth}px`,
                      "--gradient": createGradient(),
                    } as React.CSSProperties
                  }
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-lg opacity-100 transition-opacity",
                    glow && !disabled && "opacity-100",
                    blur > 0 && "blur-[var(--blur)]",
                    disabled && "!hidden"
                  )}
                >
                  <div
                    className={cn(
                      "glow rounded-lg",
                      'after:content-[""] after:rounded-lg after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
                      "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
                      "after:[background:var(--gradient)] after:[background-attachment:fixed]",
                      "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
                      "after:[mask-clip:padding-box,border-box]",
                      "after:[mask-composite:intersect]",
                      "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
                    )}
                  />
                </div>

                {/* Content container */}
                <div
                  className="relative z-10 p-4 rounded-lg"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                    border: `1px solid ${theme.secondaryColor}40`,
                    boxShadow: `0 1px 3px ${theme.secondaryShade}20`,
                  }}
                >
                  {children}
                </div>
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                className={cn("relative", className)}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Static border for disabled state */}
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded-xl border-2 opacity-0 transition-opacity",
                    glow && disabled && "opacity-100"
                  )}
                  style={{
                    borderColor: `${theme.secondaryColor}40`,
                  }}
                />

                {/* Animated glow effect */}
                <div
                  ref={containerRef}
                  style={
                    {
                      "--blur": `${blur}px`,
                      "--spread": spread,
                      "--start": "0",
                      "--active": "0",
                      "--glowingeffect-border-width": `${borderWidth * 2}px`,
                      "--gradient": createGradient(),
                    } as React.CSSProperties
                  }
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-xl opacity-100 transition-opacity",
                    glow && !disabled && "opacity-100",
                    blur > 0 && "blur-[var(--blur)]",
                    disabled && "!hidden"
                  )}
                >
                  <div
                    className={cn(
                      "glow rounded-xl",
                      'after:content-[""] after:rounded-xl after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
                      "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
                      "after:[background:var(--gradient)] after:[background-attachment:fixed]",
                      "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
                      "after:[mask-clip:padding-box,border-box]",
                      "after:[mask-composite:intersect]",
                      "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]"
                    )}
                  />
                </div>

                {/* Content container */}
                <div
                  className="relative z-10 p-6 rounded-xl"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                    border: `2px solid ${theme.secondaryColor}40`,
                    boxShadow: `0 4px 6px ${theme.secondaryShade}20`,
                  }}
                >
                  {children}
                </div>
              </motion.div>
            );

          default:
            return null;
        }

      case "minimal":
        switch (scale) {
          case "sm":
            return (
              <motion.div
                className={cn("relative", className)}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Static border for disabled state */}
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded border-b opacity-0 transition-opacity",
                    glow && disabled && "opacity-100"
                  )}
                  style={{
                    borderBottomColor: `${theme.secondaryColor}40`,
                  }}
                />

                {/* Minimal glow effect - only bottom border */}
                <div
                  ref={containerRef}
                  style={
                    {
                      "--blur": `${blur}px`,
                      "--spread": spread,
                      "--start": "0",
                      "--active": "0",
                      "--glowingeffect-border-width": `${borderWidth}px`,
                      "--gradient": `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-100 transition-opacity",
                    glow && !disabled && "opacity-100",
                    blur > 0 && "blur-[var(--blur)]",
                    disabled && "!hidden"
                  )}
                >
                  <div
                    className={cn(
                      "glow h-full w-full",
                      'after:content-[""] after:absolute after:inset-0',
                      "after:[background:var(--gradient)]",
                      "after:opacity-[var(--active)] after:transition-opacity after:duration-300"
                    )}
                  />
                </div>

                {/* Content container */}
                <div
                  className="relative z-10 p-2"
                  style={{
                    backgroundColor: "transparent",
                    color: theme.textColor,
                    borderBottom: `1px solid ${theme.secondaryColor}40`,
                  }}
                >
                  {children}
                </div>
              </motion.div>
            );

          case "lg":
            return (
              <motion.div
                className={cn("relative", className)}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Static border for disabled state */}
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded border-b opacity-0 transition-opacity",
                    glow && disabled && "opacity-100"
                  )}
                  style={{
                    borderBottomColor: `${theme.secondaryColor}40`,
                  }}
                />

                {/* Minimal glow effect - only bottom border */}
                <div
                  ref={containerRef}
                  style={
                    {
                      "--blur": `${blur}px`,
                      "--spread": spread,
                      "--start": "0",
                      "--active": "0",
                      "--glowingeffect-border-width": `${borderWidth}px`,
                      "--gradient": `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "pointer-events-none absolute bottom-0 left-0 right-0 h-px opacity-100 transition-opacity",
                    glow && !disabled && "opacity-100",
                    blur > 0 && "blur-[var(--blur)]",
                    disabled && "!hidden"
                  )}
                >
                  <div
                    className={cn(
                      "glow h-full w-full",
                      'after:content-[""] after:absolute after:inset-0',
                      "after:[background:var(--gradient)]",
                      "after:opacity-[var(--active)] after:transition-opacity after:duration-300"
                    )}
                  />
                </div>

                {/* Content container */}
                <div
                  className="relative z-10 p-3"
                  style={{
                    backgroundColor: "transparent",
                    color: theme.textColor,
                    borderBottom: `1px solid ${theme.secondaryColor}40`,
                  }}
                >
                  {children}
                </div>
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                className={cn("relative", className)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Static border for disabled state */}
                <div
                  className={cn(
                    "pointer-events-none absolute -inset-px rounded border-b-2 opacity-0 transition-opacity",
                    glow && disabled && "opacity-100"
                  )}
                  style={{
                    borderBottomColor: `${theme.secondaryColor}40`,
                  }}
                />

                {/* Minimal glow effect - only bottom border */}
                <div
                  ref={containerRef}
                  style={
                    {
                      "--blur": `${blur}px`,
                      "--spread": spread,
                      "--start": "0",
                      "--active": "0",
                      "--glowingeffect-border-width": `${borderWidth * 2}px`,
                      "--gradient": `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 opacity-100 transition-opacity",
                    glow && !disabled && "opacity-100",
                    blur > 0 && "blur-[var(--blur)]",
                    disabled && "!hidden"
                  )}
                >
                  <div
                    className={cn(
                      "glow h-full w-full",
                      'after:content-[""] after:absolute after:inset-0',
                      "after:[background:var(--gradient)]",
                      "after:opacity-[var(--active)] after:transition-opacity after:duration-300"
                    )}
                  />
                </div>

                {/* Content container */}
                <div
                  className="relative z-10 p-4"
                  style={{
                    backgroundColor: "transparent",
                    color: theme.textColor,
                    borderBottom: `2px solid ${theme.secondaryColor}40`,
                  }}
                >
                  {children}
                </div>
              </motion.div>
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }
);

CardGlow.displayName = "CardGlow";

export { CardGlow };
