import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type LabelProps = HTMLMotionProps<"label"> & {
  children: React.ReactNode;
  dimmed?: boolean;
  required?: boolean;
  disabled?: boolean;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  colorVariant?: "default" | "error" | "success" | "accent" | "warning";
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      children,
      className,
      dimmed = false,
      required = false,
      disabled = false,
      variant = "default",
      scale = "lg",
      colorVariant = "default",
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const getColorForVariant = () => {
      if (disabled) return `${theme.textColor}40`;

      switch (colorVariant) {
        case "error":
          return theme.errorColor;
        case "success":
          return theme.successColor;
        case "accent":
          return theme.accentColor;
        case "warning":
          return theme.warningColor || theme.accentColor;
        default:
          return dimmed ? `${theme.textColor}70` : theme.textColor;
      }
    };

    // Render based on design variant
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <motion.label
                ref={ref}
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium leading-none",
                  disabled && "cursor-not-allowed",
                  className
                )}
                style={{
                  color: getColorForVariant(),
                }}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={!disabled ? { scale: 1.01 } : {}}
                {...props}
              >
                <span>{children}</span>
                {required && (
                  <motion.span
                    className="text-xs"
                    style={{ color: theme.errorColor }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    *
                  </motion.span>
                )}
              </motion.label>
            );

          case "lg":
            return (
              <motion.label
                ref={ref}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-medium leading-none",
                  disabled && "cursor-not-allowed",
                  className
                )}
                style={{
                  color: getColorForVariant(),
                }}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={!disabled ? { scale: 1.01 } : {}}
                {...props}
              >
                <span>{children}</span>
                {required && (
                  <motion.span
                    className="text-sm"
                    style={{ color: theme.errorColor }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    *
                  </motion.span>
                )}
              </motion.label>
            );

          case "xl":
            return (
              <motion.label
                ref={ref}
                className={cn(
                  "inline-flex items-center gap-2 text-base font-medium leading-none",
                  disabled && "cursor-not-allowed",
                  className
                )}
                style={{
                  color: getColorForVariant(),
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={!disabled ? { scale: 1.01 } : {}}
                {...props}
              >
                <span>{children}</span>
                {required && (
                  <motion.span
                    className="text-base"
                    style={{ color: theme.errorColor }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    *
                  </motion.span>
                )}
              </motion.label>
            );

          default:
            return null;
        }

      case "minimal":
        switch (scale) {
          case "sm":
            return (
              <motion.label
                ref={ref}
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-normal leading-relaxed border-b border-transparent transition-all duration-200",
                  disabled && "cursor-not-allowed",
                  className
                )}
                style={{
                  color: getColorForVariant(),
                  borderBottomColor:
                    colorVariant !== "default"
                      ? `${getColorForVariant()}20`
                      : "transparent",
                }}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={
                  !disabled
                    ? {
                        y: -1,
                        borderBottomColor: `${getColorForVariant()}40`,
                      }
                    : {}
                }
                {...props}
              >
                <span>{children}</span>
                {required && (
                  <motion.span
                    className="text-xs"
                    style={{ color: theme.errorColor }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    *
                  </motion.span>
                )}
              </motion.label>
            );

          case "lg":
            return (
              <motion.label
                ref={ref}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-normal leading-relaxed border-b border-transparent transition-all duration-200",
                  disabled && "cursor-not-allowed",
                  className
                )}
                style={{
                  color: getColorForVariant(),
                  borderBottomColor:
                    colorVariant !== "default"
                      ? `${getColorForVariant()}20`
                      : "transparent",
                }}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={
                  !disabled
                    ? {
                        y: -2,
                        borderBottomColor: `${getColorForVariant()}40`,
                      }
                    : {}
                }
                {...props}
              >
                <span>{children}</span>
                {required && (
                  <motion.span
                    className="text-sm"
                    style={{ color: theme.errorColor }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    *
                  </motion.span>
                )}
              </motion.label>
            );

          case "xl":
            return (
              <motion.label
                ref={ref}
                className={cn(
                  "inline-flex items-center gap-2 text-base font-normal leading-relaxed border-b-2 border-transparent transition-all duration-200",
                  disabled && "cursor-not-allowed",
                  className
                )}
                style={{
                  color: getColorForVariant(),
                  borderBottomColor:
                    colorVariant !== "default"
                      ? `${getColorForVariant()}20`
                      : "transparent",
                }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                whileHover={
                  !disabled
                    ? {
                        y: -3,
                        borderBottomColor: `${getColorForVariant()}40`,
                      }
                    : {}
                }
                {...props}
              >
                <span>{children}</span>
                {required && (
                  <motion.span
                    className="text-base"
                    style={{ color: theme.errorColor }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    *
                  </motion.span>
                )}
              </motion.label>
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }
);

Label.displayName = "Label";

export { Label };
