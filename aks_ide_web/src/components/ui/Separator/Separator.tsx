import React from "react";
import { motion } from "framer-motion";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type SeparatorProps = {
  className?: string;
  orientation?: "horizontal" | "vertical";
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  decorative?: boolean;
};

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      variant = "default",
      scale = "lg",
      decorative = true,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Render based on design variant
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <motion.div
                ref={ref}
                role={decorative ? "none" : "separator"}
                aria-orientation={orientation}
                className={cn(
                  "shrink-0",
                  orientation === "horizontal" ? "h-px w-full my-2" : "w-px h-full mx-2",
                  className
                )}
                style={{
                  backgroundColor: `${theme.secondaryColor}60`,
                  boxShadow: `0 0 1px ${theme.secondaryShade}20`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                {...props}
              />
            );

          case "lg":
            return (
              <motion.div
                ref={ref}
                role={decorative ? "none" : "separator"}
                aria-orientation={orientation}
                className={cn(
                  "shrink-0 relative",
                  orientation === "horizontal" ? "h-px w-full my-4" : "w-px h-full mx-4",
                  className
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                {...props}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: `${theme.secondaryColor}70`,
                    boxShadow: `0 0 2px ${theme.secondaryShade}30`,
                  }}
                />
                <div
                  className={cn(
                    "absolute",
                    orientation === "horizontal"
                      ? "top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-full"
                      : "left-0 top-1/2 transform -translate-y-1/2 h-1/3 w-full"
                  )}
                  style={{
                    background: `linear-gradient(${
                      orientation === "horizontal" ? "90deg" : "180deg"
                    }, transparent, ${theme.primaryColor}40, transparent)`,
                  }}
                />
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                ref={ref}
                role={decorative ? "none" : "separator"}
                aria-orientation={orientation}
                className={cn(
                  "shrink-0 relative",
                  orientation === "horizontal" ? "h-0.5 w-full my-6" : "w-0.5 h-full mx-6",
                  className
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                {...props}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: `${theme.secondaryColor}80`,
                    boxShadow: `0 0 4px ${theme.secondaryShade}40`,
                  }}
                />
                <motion.div
                  className={cn(
                    "absolute rounded-full",
                    orientation === "horizontal"
                      ? "top-0 left-0 w-full h-full"
                      : "left-0 top-0 w-full h-full"
                  )}
                  style={{
                    background: `linear-gradient(${
                      orientation === "horizontal" ? "90deg" : "180deg"
                    }, transparent, ${theme.primaryColor}60, transparent)`,
                  }}
                  initial={{ 
                    [orientation === "horizontal" ? "scaleX" : "scaleY"]: 0 
                  }}
                  animate={{ 
                    [orientation === "horizontal" ? "scaleX" : "scaleY"]: 1 
                  }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                />
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
                ref={ref}
                role={decorative ? "none" : "separator"}
                aria-orientation={orientation}
                className={cn(
                  "shrink-0",
                  orientation === "horizontal" ? "h-px w-full my-1" : "w-px h-full mx-1",
                  className
                )}
                style={{
                  backgroundColor: `${theme.textColor}20`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                {...props}
              />
            );

          case "lg":
            return (
              <motion.div
                ref={ref}
                role={decorative ? "none" : "separator"}
                aria-orientation={orientation}
                className={cn(
                  "shrink-0 relative",
                  orientation === "horizontal" ? "h-px w-full my-3" : "w-px h-full mx-3",
                  className
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                {...props}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: `${theme.textColor}30`,
                  }}
                  initial={{ 
                    [orientation === "horizontal" ? "scaleX" : "scaleY"]: 0 
                  }}
                  animate={{ 
                    [orientation === "horizontal" ? "scaleX" : "scaleY"]: 1 
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                ref={ref}
                role={decorative ? "none" : "separator"}
                aria-orientation={orientation}
                className={cn(
                  "shrink-0 relative",
                  orientation === "horizontal" ? "h-px w-full my-5" : "w-px h-full mx-5",
                  className
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                {...props}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: `${theme.textColor}40`,
                  }}
                  initial={{ 
                    [orientation === "horizontal" ? "scaleX" : "scaleY"]: 0 
                  }}
                  animate={{ 
                    [orientation === "horizontal" ? "scaleX" : "scaleY"]: 1 
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                <motion.div
                  className={cn(
                    "absolute",
                    orientation === "horizontal"
                      ? "top-0 left-1/2 transform -translate-x-1/2 w-1/4 h-full"
                      : "left-0 top-1/2 transform -translate-y-1/2 h-1/4 w-full"
                  )}
                  style={{
                    backgroundColor: `${theme.primaryColor}60`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
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

Separator.displayName = "Separator";

export { Separator };