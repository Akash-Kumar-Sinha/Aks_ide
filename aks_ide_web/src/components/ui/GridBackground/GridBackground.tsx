import { cn } from "../lib/utils";
import React from "react";
import { useTheme, type Theme } from "../lib/useTheme";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

interface GridBackgroundProps {
  children?: React.ReactNode;
  designVariant?: DesignVariantType;
  spaceVariant?: SpaceVariantType;
  className?: string;
}

interface SpaceStyles {
  height: string;
  padding: string;
  textSize: string;
  gridSize: string;
}

interface DesignStyles {
  backgroundImage: string;
  maskImage: string;
  textGradient: string;
}

const getSpaceStyles = (variant: SpaceVariantType): SpaceStyles => {
  const styles: Record<SpaceVariantType, SpaceStyles> = {
    sm: {
      height: "h-[30rem]",
      padding: "p-4",
      textSize: "text-2xl sm:text-4xl",
      gridSize: "20px 20px",
    },
    lg: {
      height: "h-[50rem]",
      padding: "p-8",
      textSize: "text-4xl sm:text-7xl",
      gridSize: "40px 40px",
    },
    xl: {
      height: "h-[70rem]",
      padding: "p-12",
      textSize: "text-5xl sm:text-8xl",
      gridSize: "60px 60px",
    },
  };
  return styles[variant];
};

const getDesignStyles = (
  variant: DesignVariantType,
  theme: Theme
): DesignStyles => {
  const gridLineColor = `${theme.textDimmed}30`;

  if (variant === "minimal") {
    return {
      backgroundImage: `linear-gradient(to right, ${gridLineColor}66 1px, transparent 1px), linear-gradient(to bottom, ${gridLineColor}66 1px, transparent 1px)`,
      maskImage: "radial-gradient(ellipse at center, transparent 40%, black)",
      textGradient: `linear-gradient(to bottom, ${theme.textColor}, ${theme.textDimmed})`,
    };
  }

  return {
    backgroundImage: `linear-gradient(to right, ${gridLineColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)`,
    maskImage: "radial-gradient(ellipse at center, transparent 20%, black)",
    textGradient:
      theme.primaryGradient ||
      `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.primaryShade})`,
  };
};

const GridBackground: React.FC<GridBackgroundProps> = ({
  children,
  designVariant = "default",
  spaceVariant = "lg",
  className = "",
}) => {
  const { theme } = useTheme();
  const spaceStyles: SpaceStyles = getSpaceStyles(spaceVariant);
  const designStyles: DesignStyles = getDesignStyles(designVariant, theme);

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center",
        spaceStyles.height,
        spaceStyles.padding,
        className
      )}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: spaceStyles.gridSize,
          backgroundImage: designStyles.backgroundImage,
        }}
      />

      {/* Mask overlay */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          backgroundColor: theme.backgroundColor,
          maskImage: designStyles.maskImage,
          WebkitMaskImage: designStyles.maskImage,
        }}
      />

      {/* Content */}
      <div className="relative z-20">
        {children || (
          <p
            className={cn(
              "bg-clip-text font-bold text-transparent py-8",
              spaceStyles.textSize
            )}
            style={{
              backgroundImage: designStyles.textGradient,
            }}
          >
            Backgrounds
          </p>
        )}
      </div>
    </div>
  );
};

export { GridBackground };
