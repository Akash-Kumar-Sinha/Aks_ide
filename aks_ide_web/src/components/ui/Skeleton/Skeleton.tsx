import React from "react";
import { motion } from "framer-motion";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type SkeletonPattern =
  | "pulse"
  | "shimmer"
  | "wave"
  | "gradient"
  | "spotlight"
  | "glimmer";
  
type SkeletonShape =
  | "rectangle"
  | "circle"
  | "rounded"
  | "pill"
  | "avatar"
  | "card"
  | "button";

type SkeletonProps = {
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  pattern?: SkeletonPattern;
  shape?: SkeletonShape;
  width?: string | number;
  height?: string | number;
  lines?: number;
  radius?: "none" | "sm" | "md" | "lg" | "full";
  animate?: boolean;
  varyLineWidths?: boolean;
  intensity?: "light" | "medium" | "strong";
  speed?: "slow" | "normal" | "fast";
  withLabel?: boolean;
  hoverable?: boolean;
  colorMode?:
    | "primary"
    | "dimmed"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  group?: boolean;
  groupCount?: number;
  groupGap?: "sm" | "md" | "lg";
  groupDirection?: "row" | "column";
  aspectRatio?: string;
  className?: string;
};

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "default",
      scale = "lg",
      pattern = "shimmer",
      shape = "rectangle",
      width,
      height,
      lines = 0,
      radius = "md",
      animate = true,
      varyLineWidths = true,
      intensity = "medium",
      speed = "normal",
      withLabel = false,
      hoverable = false,
      colorMode = "dimmed",
      group = false,
      groupCount = 3,
      groupGap = "md",
      groupDirection = "column",
      aspectRatio,
      className,
    },
    ref
  ) => {
    const { theme } = useTheme();

    const getScaleConfig = () => {
      switch (scale) {
        case "sm":
          return {
            baseSize: 16,
            labelHeight: 12,
            lineHeight: 8,
            spacing: 8,
            fontSize: 10,
            borderRadius: {
              none: 0,
              sm: 2,
              md: 4,
              lg: 6,
              full: 9999,
            },
          };
        case "lg":
          return {
            baseSize: 24,
            labelHeight: 16,
            lineHeight: 12,
            spacing: 12,
            fontSize: 14,
            borderRadius: {
              none: 0,
              sm: 4,
              md: 8,
              lg: 12,
              full: 9999,
            },
          };
        case "xl":
          return {
            baseSize: 32,
            labelHeight: 20,
            lineHeight: 16,
            spacing: 16,
            fontSize: 16,
            borderRadius: {
              none: 0,
              sm: 6,
              md: 12,
              lg: 16,
              full: 9999,
            },
          };
        default:
          return {
            baseSize: 24,
            labelHeight: 16,
            lineHeight: 12,
            spacing: 12,
            fontSize: 14,
            borderRadius: {
              none: 0,
              sm: 4,
              md: 8,
              lg: 12,
              full: 9999,
            },
          };
      }
    };

    const scaleConfig = getScaleConfig();

    const getIntensityConfig = () => {
      switch (intensity) {
        case "light":
          return { baseOpacity: 0.08, accentOpacity: 0.12 };
        case "medium":
          return { baseOpacity: 0.15, accentOpacity: 0.25 };
        case "strong":
          return { baseOpacity: 0.25, accentOpacity: 0.4 };
        default:
          return { baseOpacity: 0.15, accentOpacity: 0.25 };
      }
    };

    const intensityConfig = getIntensityConfig();

    const getSpeedConfig = () => {
      switch (speed) {
        case "slow":
          return { duration: 2.5 };
        case "normal":
          return { duration: 1.5 };
        case "fast":
          return { duration: 0.8 };
        default:
          return { duration: 1.5 };
      }
    };

    const speedConfig = getSpeedConfig();

    const getColorTheme = () => {
      switch (colorMode) {
        case "primary":
          return theme.primaryColor;
        case "dimmed":
          return theme.textDimmed;
        case "accent":
          return theme.accentColor;
        case "info":
          return theme.infoColor;
        case "success":
          return theme.successColor;
        case "warning":
          return theme.warningColor;
        case "error":
          return theme.errorColor;
        default:
          return theme.primaryColor;
      }
    };

    const colorTheme = getColorTheme();

    // Helper function to get base background color with opacity
    const getBaseBackgroundColor = () => {
      return colorTheme + Math.round(intensityConfig.baseOpacity * 255).toString(16).padStart(2, "0");
    };

    // Helper function to get accent color with opacity
    const getAccentColor = () => {
      return colorTheme + Math.round(intensityConfig.accentOpacity * 255).toString(16).padStart(2, "0");
    };

    const getDimensions = () => {
      switch (shape) {
        case "circle":
          return {
            width: width || scaleConfig.baseSize * 3,
            height: height || scaleConfig.baseSize * 3,
            borderRadius: scaleConfig.borderRadius.full,
          };
        case "rounded":
          return {
            width: width || "100%",
            height: height || scaleConfig.baseSize * 2,
            borderRadius: scaleConfig.borderRadius[radius],
          };
        case "pill":
          return {
            width: width || scaleConfig.baseSize * 6,
            height: height || scaleConfig.baseSize * 2,
            borderRadius: scaleConfig.borderRadius.full,
          };
        case "avatar":
          return {
            width: width || scaleConfig.baseSize * 2.5,
            height: height || scaleConfig.baseSize * 2.5,
            borderRadius: scaleConfig.borderRadius.full,
          };
        case "card":
          return {
            width: width || "100%",
            height: height || scaleConfig.baseSize * 8,
            borderRadius: scaleConfig.borderRadius.lg,
          };
        case "button":
          return {
            width: width || scaleConfig.baseSize * 5,
            height: height || scaleConfig.baseSize * 2,
            borderRadius: scaleConfig.borderRadius.md,
          };
        case "rectangle":
        default:
          return {
            width: width || "100%",
            height: height || scaleConfig.baseSize,
            borderRadius: scaleConfig.borderRadius[radius],
          };
      }
    };

    const dimensions = getDimensions();

    const renderPulse = () => (
      <motion.div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          backgroundColor: getBaseBackgroundColor(),
        }}
        animate={{
          opacity: [
            intensityConfig.baseOpacity,
            intensityConfig.accentOpacity,
            intensityConfig.baseOpacity,
          ],
        }}
        transition={{
          duration: speedConfig.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );

    const renderShimmer = () => (
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          position: "relative",
          overflow: "hidden",
          backgroundColor: getBaseBackgroundColor(),
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: `linear-gradient(90deg, transparent, ${getAccentColor()}, transparent)`,
          }}
          animate={{
            left: ["-100%", "100%"],
          }}
          transition={{
            duration: speedConfig.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );

    const renderWave = () => (
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          position: "relative",
          overflow: "hidden",
          backgroundColor: getBaseBackgroundColor(),
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${getAccentColor()}, transparent)`,
              transform: `translateX(-100%)`,
            }}
            animate={{
              transform: ["translateX(-100%)", "translateX(100%)"],
            }}
            transition={{
              duration: speedConfig.duration + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );

    const renderGradient = () => (
      <motion.div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          background: `linear-gradient(45deg, 
            ${getBaseBackgroundColor()}, 
            ${getAccentColor()},
            ${colorTheme}${Math.round(intensityConfig.baseOpacity * 1.2 * 255).toString(16).padStart(2, "0")}
          )`,
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: speedConfig.duration * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );

    const renderSpotlight = () => (
      <div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          position: "relative",
          overflow: "hidden",
          backgroundColor: getBaseBackgroundColor(),
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${colorTheme}${Math.round(intensityConfig.accentOpacity * 2 * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
            transform: "translate(-50%, -50%) scale(1)",
          }}
          animate={{
            scale: [1, 3],
            opacity: [0, intensityConfig.accentOpacity, 0],
          }}
          transition={{
            duration: speedConfig.duration,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </div>
    );

    const renderGlimmer = () => (
      <motion.div
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius,
          backgroundColor: getBaseBackgroundColor(),
        }}
        animate={{
          boxShadow: [
            `0 0 0px ${getBaseBackgroundColor()}`,
            `0 0 20px ${getAccentColor()}`,
            `0 0 0px ${getBaseBackgroundColor()}`,
          ],
          opacity: [
            intensityConfig.baseOpacity,
            intensityConfig.accentOpacity,
            intensityConfig.baseOpacity,
          ],
        }}
        transition={{
          duration: speedConfig.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );

    const renderPattern = () => {
      if (!animate) {
        return (
          <div
            style={{
              width: dimensions.width,
              height: dimensions.height,
              borderRadius: dimensions.borderRadius,
              backgroundColor: getBaseBackgroundColor(),
            }}
          />
        );
      }

      const patternMap: Record<SkeletonPattern, () => JSX.Element> = {
        pulse: renderPulse,
        shimmer: renderShimmer,
        wave: renderWave,
        gradient: renderGradient,
        spotlight: renderSpotlight,
        glimmer: renderGlimmer,
      };

      return patternMap[pattern]();
    };

    const renderLabel = () => {
      if (!withLabel) return null;

      return (
        <motion.div
          style={{
            width: "25%",
            height: scaleConfig.labelHeight,
            borderRadius: scaleConfig.borderRadius.sm,
            backgroundColor: colorTheme + Math.round(intensityConfig.baseOpacity * 0.7 * 255).toString(16).padStart(2, "0"),
            marginBottom: scaleConfig.spacing,
          }}
          animate={
            animate
              ? {
                  opacity: [
                    intensityConfig.baseOpacity * 0.7,
                    intensityConfig.accentOpacity * 0.7,
                    intensityConfig.baseOpacity * 0.7,
                  ],
                }
              : {}
          }
          transition={
            animate
              ? {
                  duration: speedConfig.duration * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1,
                }
              : {}
          }
        />
      );
    };

    const renderLines = () => {
      if (lines <= 0) return null;

      return (
        <div
          style={{
            marginTop: scaleConfig.spacing * 1.5,
            display: "flex",
            flexDirection: "column",
            gap: scaleConfig.spacing * 0.7,
          }}
        >
          {Array.from({ length: lines }).map((_, i) => {
            let lineWidth = "100%";
            if (varyLineWidths) {
              if (i === lines - 1) {
                lineWidth = "75%";
              } else if (i % 2 !== 0) {
                lineWidth = "85%";
              }
            }

            return (
              <motion.div
                key={i}
                style={{
                  width: lineWidth,
                  height: scaleConfig.lineHeight,
                  borderRadius: scaleConfig.borderRadius.sm,
                  backgroundColor: colorTheme + Math.round(intensityConfig.baseOpacity * 0.85 * 255).toString(16).padStart(2, "0"),
                }}
                animate={
                  animate
                    ? {
                        opacity: [
                          intensityConfig.baseOpacity * 0.85,
                          intensityConfig.accentOpacity * 0.85,
                          intensityConfig.baseOpacity * 0.85,
                        ],
                      }
                    : {}
                }
                transition={
                  animate
                    ? {
                        duration: speedConfig.duration * 0.9,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                      }
                    : {}
                }
              />
            );
          })}
        </div>
      );
    };

    const renderSingleSkeleton = (index?: number) => {
      return (
        <motion.div
          key={index}
          style={{
            width: "100%",
          }}
          initial={hoverable ? { transform: "translateY(0px)" } : {}}
          whileHover={
            hoverable
              ? {
                  transform: "translateY(-2px)",
                  transition: { duration: 0.2 },
                }
              : {}
          }
          animate={index !== undefined ? {} : {}}
          transition={
            index !== undefined
              ? {
                  delay: index * 0.1,
                }
              : {}
          }
        >
          {renderLabel()}
          <div
            style={{
              ...(aspectRatio ? { aspectRatio } : {}),
              width: "100%",
            }}
          >
            {renderPattern()}
          </div>
          {renderLines()}
        </motion.div>
      );
    };

    const renderGroup = () => {
      const gapMap = {
        sm: scaleConfig.spacing,
        md: scaleConfig.spacing * 2,
        lg: scaleConfig.spacing * 3,
      };

      return (
        <div
          style={{
            display: "flex",
            flexDirection: groupDirection,
            gap: gapMap[groupGap],
            width: "100%",
            ...(groupDirection === "row" ? { flexWrap: "wrap" } : {}),
          }}
        >
          {Array.from({ length: groupCount }).map((_, i) => (
            <div key={i} style={{ width: "100%" }}>
              {renderSingleSkeleton(i)}
            </div>
          ))}
        </div>
      );
    };

    // Render based on design variant
    switch (variant) {
      case "default":
        return (
          <motion.div
            ref={ref}
            className={cn("flex flex-col items-start justify-start", className)}
            style={{
              backgroundColor: theme.backgroundColor + "05",
              borderRadius: scaleConfig.borderRadius.lg,
              padding: scaleConfig.spacing * 1.5,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {group ? renderGroup() : renderSingleSkeleton()}
          </motion.div>
        );

      case "minimal":
        return (
          <motion.div
            ref={ref}
            className={cn("flex flex-col items-start justify-start", className)}
            style={{
              padding: scaleConfig.spacing,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {group ? renderGroup() : renderSingleSkeleton()}
          </motion.div>
        );

      default:
        return null;
    }
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };