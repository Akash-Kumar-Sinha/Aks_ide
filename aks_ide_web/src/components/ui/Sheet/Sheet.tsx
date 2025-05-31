import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "../lib/utils";
import useTheme from "../lib/useTheme";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

// Import the scrollbar styles (same as Card component)
import "../lib/scroll.css"; // Adjust path as needed

type ScrollVariantType =
  | "default"
  | "primary"
  | "minimal"
  | "gradient"
  | "glass"
  | "glow"
  | "hidden"
  | "hover";

type ScrollDirectionType = "vertical" | "horizontal" | "both" | "none";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

// Enhanced SheetOverlay with theme integration and proper animations
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay> & {
    variant?: DesignVariantType;
  }
>(({ className, variant = "default", ...props }, ref) => {
  const { theme } = useTheme();

  const getOverlayClasses = () => {
    const baseClasses =
      "fixed inset-0 z-50 transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

    switch (variant) {
      case "minimal":
        return cn(baseClasses, "backdrop-blur-sm", className);
      case "default":
      default:
        return cn(baseClasses, "backdrop-blur-md", className);
    }
  };

  const getOverlayStyles = () => {
    switch (variant) {
      case "minimal":
        return {
          backgroundColor: `${theme.backgroundColor}40`,
        };
      case "default":
      default:
        return {
          backgroundColor: `${theme.backgroundColor}CC`,
        };
    }
  };

  return (
    <SheetPrimitive.Overlay
      className={getOverlayClasses()}
      style={getOverlayStyles()}
      {...props}
      ref={ref}
    />
  );
});
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 shadow-lg transition-all ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  glowEffect?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "right",
      className,
      children,
      variant = "default",
      scale = "lg",
      glowEffect = false,
      scrollable = false,
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      // Add a slight delay to ensure smooth animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }, []);

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return {
            padding: "0.75rem",
          };
        case "lg":
          return {
            padding: "1rem",
          };
        case "xl":
          return {
            padding: "1.25rem",
          };
        default:
          return {
            padding: "1rem",
          };
      }
    };

    const getVariantStyles = () => {
      const baseStyles = getScaleStyles();

      switch (variant) {
        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: `${theme.backgroundColor}F5`,
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}20`,
            backdropFilter: "blur(10px)",
            transform: isVisible ? "translateX(0)" : undefined,
            opacity: isVisible ? 1 : undefined,
          };
        case "default":
        default:
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}40`,
            boxShadow: glowEffect
              ? `0 0 30px ${theme.primaryColor}20, 0 10px 25px -5px ${theme.secondaryShade}30`
              : `0 10px 25px -5px ${theme.secondaryShade}30`,
            transform: isVisible ? "translateX(0)" : undefined,
            opacity: isVisible ? 1 : undefined,
          };
      }
    };

    // Generate scrollbar class names (similar to Card component)
    const getScrollbarClasses = () => {
      if (!scrollable) return "";

      const classes = ["scrollable-container"];

      // Add variant-specific class
      if (scrollVariant !== "default") {
        classes.push(`scrollable-${scrollVariant}`);
      }

      // Add direction-specific class
      if (scrollDirection !== "none") {
        classes.push(`scroll-${scrollDirection}`);
      }

      // Add scale-specific class
      classes.push(`scrollable-${scale}`);

      // Add responsive class
      classes.push("scrollable-responsive");

      return classes.join(" ");
    };

    // Generate container styles for scrollable content
    const getScrollableStyles = () => {
      if (!scrollable) return {};

      const styles: React.CSSProperties = {};

      if (maxHeight) {
        styles.maxHeight =
          typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
      }

      if (maxWidth) {
        styles.maxWidth =
          typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
      }

      // Set overflow based on scroll direction
      switch (scrollDirection) {
        case "vertical":
          styles.overflowY = "auto";
          styles.overflowX = "hidden";
          break;
        case "horizontal":
          styles.overflowX = "auto";
          styles.overflowY = "hidden";
          styles.whiteSpace = "nowrap";
          break;
        case "both":
          styles.overflow = "auto";
          break;
        case "none":
        default:
          break;
      }

      return styles;
    };

    const getBorderRadius = () => {
      if (side === "left" || side === "right") return "0";
      switch (scale) {
        case "sm":
          return "0.5rem";
        case "lg":
          return "0.75rem";
        case "xl":
          return "1rem";
        default:
          return "0.75rem";
      }
    };

    return (
      <SheetPortal>
        <SheetOverlay variant={variant} />
        <SheetPrimitive.Content
          ref={ref}
          className={cn(
            sheetVariants({ side }),
            scrollable && getScrollbarClasses(),
            className
          )}
          style={{
            ...getVariantStyles(),
            ...getScrollableStyles(),
            borderRadius: getBorderRadius(),
          }}
          {...props}
        >
          <SheetPrimitive.Close
            className={cn(
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary"
            )}
            style={{
              color: theme.textColor,
              backgroundColor: `${theme.primaryColor}10`,
              border: `1px solid ${theme.secondaryColor}20`,
              padding: "0.5rem",
              cursor: "pointer",
              zIndex: 60,
            }}
          >
            <X className="h-4 w-4 transition-transform duration-200" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-100">
            {children}
          </div>
        </SheetPrimitive.Content>
      </SheetPortal>
    );
  }
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

// Enhanced SheetHeader with smooth animations and scroll support
interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: SpaceVariantType;
  showBorder?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
}

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  (
    {
      className,
      scale = "lg",
      showBorder = true,
      scrollable = false,
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);

    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0.75rem 0.75rem 0.5rem 0.75rem";
        case "lg":
          return "1rem 1rem 0.75rem 1rem";
        case "xl":
          return "1.25rem 1.25rem 1rem 1.25rem";
        default:
          return "1rem 1rem 0.75rem 1rem";
      }
    };

    // Generate scrollbar classes for header content
    const getHeaderScrollbarClasses = () => {
      if (!scrollable) return "";

      const classes = ["scrollable-container"];

      if (scrollVariant !== "default") {
        classes.push(`scrollable-${scrollVariant}`);
      }

      if (scrollDirection !== "none") {
        classes.push(`scroll-${scrollDirection}`);
      }

      classes.push(`scrollable-${scale}`);
      classes.push("scrollable-responsive");

      return classes.join(" ");
    };

    // Generate styles for scrollable header content
    const getHeaderScrollableStyles = () => {
      if (!scrollable) return {};

      const styles: React.CSSProperties = {};

      if (maxHeight) {
        styles.maxHeight =
          typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
      }

      if (maxWidth) {
        styles.maxWidth =
          typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
      }

      switch (scrollDirection) {
        case "vertical":
          styles.overflowY = "auto";
          styles.overflowX = "hidden";
          if (!maxHeight) styles.maxHeight = "200px"; // Default max height for header
          break;
        case "horizontal":
          styles.overflowX = "auto";
          styles.overflowY = "hidden";
          styles.whiteSpace = "nowrap";
          break;
        case "both":
          styles.overflow = "auto";
          if (!maxHeight) styles.maxHeight = "200px";
          break;
        case "none":
        default:
          break;
      }

      return styles;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-2 text-center sm:text-left transition-all duration-300 ease-in-out animate-in fade-in-0 slide-in-from-top-2",
          scrollable && getHeaderScrollbarClasses(),
          className
        )}
        style={{
          color: theme.textColor,
          padding: getPadding(),
          borderBottom: showBorder
            ? `1px solid ${theme.secondaryColor}20`
            : "none",
          backgroundColor: isHovered
            ? `${theme.primaryColor}05`
            : "transparent",
          transform: isHovered ? "translateY(-1px)" : "translateY(0)",
          ...getHeaderScrollableStyles(),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      />
    );
  }
);
SheetHeader.displayName = "SheetHeader";

// Enhanced SheetBody component for scrollable content
interface SheetBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: SpaceVariantType;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
}

const SheetBody = React.forwardRef<HTMLDivElement, SheetBodyProps>(
  (
    {
      className,
      scale = "lg",
      scrollable = true, // Default to true for body content
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      ...props
    },
    ref
  ) => {
    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0.5rem 0.75rem";
        case "lg":
          return "0.75rem 1rem";
        case "xl":
          return "1rem 1.25rem";
        default:
          return "0.75rem 1rem";
      }
    };

    // Generate scrollbar classes for body content
    const getBodyScrollbarClasses = () => {
      if (!scrollable) return "";

      const classes = ["scrollable-container"];

      if (scrollVariant !== "default") {
        classes.push(`scrollable-${scrollVariant}`);
      }

      if (scrollDirection !== "none") {
        classes.push(`scroll-${scrollDirection}`);
      }

      classes.push(`scrollable-${scale}`);
      classes.push("scrollable-responsive");

      return classes.join(" ");
    };

    // Generate styles for scrollable body content
    const getBodyScrollableStyles = () => {
      if (!scrollable) return {};

      const styles: React.CSSProperties = {};

      if (maxHeight) {
        styles.maxHeight =
          typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
      }

      if (maxWidth) {
        styles.maxWidth =
          typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
      }

      switch (scrollDirection) {
        case "vertical":
          styles.overflowY = "auto";
          styles.overflowX = "hidden";
          if (!maxHeight) styles.maxHeight = "calc(100vh - 200px)"; // Default responsive height
          break;
        case "horizontal":
          styles.overflowX = "auto";
          styles.overflowY = "hidden";
          styles.whiteSpace = "nowrap";
          break;
        case "both":
          styles.overflow = "auto";
          if (!maxHeight) styles.maxHeight = "calc(100vh - 200px)";
          break;
        case "none":
        default:
          break;
      }

      return styles;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 delay-100",
          scrollable && getBodyScrollbarClasses(),
          className
        )}
        style={{
          padding: getPadding(),
          ...getBodyScrollableStyles(),
        }}
        {...props}
      />
    );
  }
);
SheetBody.displayName = "SheetBody";

// Enhanced SheetFooter with animations and scroll support
interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  scale?: SpaceVariantType;
  showBorder?: boolean;
  sticky?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
}

const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
  (
    {
      className,
      scale = "lg",
      showBorder = true,
      sticky = false,
      scrollable = false,
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0.5rem 0.75rem 0.75rem 0.75rem";
        case "lg":
          return "0.75rem 1rem 1rem 1rem";
        case "xl":
          return "1rem 1.25rem 1.25rem 1.25rem";
        default:
          return "0.75rem 1rem 1rem 1rem";
      }
    };

    // Generate scrollbar classes for footer content
    const getFooterScrollbarClasses = () => {
      if (!scrollable) return "";

      const classes = ["scrollable-container"];

      if (scrollVariant !== "default") {
        classes.push(`scrollable-${scrollVariant}`);
      }

      if (scrollDirection !== "none") {
        classes.push(`scroll-${scrollDirection}`);
      }

      classes.push(`scrollable-${scale}`);
      classes.push("scrollable-responsive");

      return classes.join(" ");
    };

    // Generate styles for scrollable footer content
    const getFooterScrollableStyles = () => {
      if (!scrollable) return {};

      const styles: React.CSSProperties = {};

      if (maxHeight) {
        styles.maxHeight =
          typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
      }

      if (maxWidth) {
        styles.maxWidth =
          typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
      }

      switch (scrollDirection) {
        case "vertical":
          styles.overflowY = "auto";
          styles.overflowX = "hidden";
          if (!maxHeight) styles.maxHeight = "150px"; // Default max height for footer
          break;
        case "horizontal":
          styles.overflowX = "auto";
          styles.overflowY = "hidden";
          styles.whiteSpace = "nowrap";
          break;
        case "both":
          styles.overflow = "auto";
          if (!maxHeight) styles.maxHeight = "150px";
          break;
        case "none":
        default:
          break;
      }

      return styles;
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2 delay-200",
          sticky && "sticky bottom-0 backdrop-blur-sm",
          scrollable && getFooterScrollbarClasses(),
          className
        )}
        style={{
          color: theme.textColor,
          padding: getPadding(),
          borderTop: showBorder
            ? `1px solid ${theme.secondaryColor}20`
            : "none",
          backgroundColor: sticky
            ? `${theme.backgroundColor}90`
            : "transparent",
          ...getFooterScrollableStyles(),
        }}
        {...props}
      />
    );
  }
);
SheetFooter.displayName = "SheetFooter";

// Enhanced SheetTitle with smooth hover animations
interface SheetTitleProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title> {
  scale?: SpaceVariantType;
  gradient?: boolean;
}

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  SheetTitleProps
>(({ className, scale = "lg", gradient = false, ...props }, ref) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const getFontSize = () => {
    switch (scale) {
      case "sm":
        return "1rem";
      case "lg":
        return "1.25rem";
      case "xl":
        return "1.5rem";
      default:
        return "1.25rem";
    }
  };

  const gradientStyle = gradient
    ? {
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : {};

  return (
    <SheetPrimitive.Title
      ref={ref}
      className={cn(
        "text-lg font-semibold text-foreground transition-all duration-200 ease-in-out cursor-default",
        className
      )}
      style={{
        fontSize: getFontSize(),
        color: gradient ? undefined : theme.textColor,
        transform: isHovered ? "scale(1.02) translateX(2px)" : "scale(1)",
        transformOrigin: "left",
        ...gradientStyle,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  );
});
SheetTitle.displayName = SheetPrimitive.Title.displayName;

// Enhanced SheetDescription with subtle animations
interface SheetDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description> {
  scale?: SpaceVariantType;
}

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  SheetDescriptionProps
>(({ className, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  const getFontSize = () => {
    switch (scale) {
      case "sm":
        return "0.75rem";
      case "lg":
        return "0.875rem";
      case "xl":
        return "1rem";
      default:
        return "0.875rem";
    }
  };

  return (
    <SheetPrimitive.Description
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground transition-all duration-200 ease-in-out",
        className
      )}
      style={{
        fontSize: getFontSize(),
        color: theme.textDimmed,
        lineHeight: "1.5",
        opacity: isHovered ? 0.9 : 0.7,
        transform: isHovered ? "translateX(1px)" : "translateX(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    />
  );
});
SheetDescription.displayName = SheetPrimitive.Description.displayName;

// Enhanced SheetBadge with pulse and hover animations
interface SheetBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  scale?: SpaceVariantType;
  pulse?: boolean;
}

const SheetBadge = React.forwardRef<HTMLDivElement, SheetBadgeProps>(
  (
    {
      children,
      className,
      variant = "primary",
      scale = "lg",
      pulse = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = React.useState(false);

    const getVariantColors = () => {
      switch (variant) {
        case "primary":
          return { bg: theme.primaryColor, text: "#ffffff" };
        case "secondary":
          return { bg: theme.secondaryColor, text: "#ffffff" };
        case "success":
          return { bg: theme.successColor, text: "#ffffff" };
        case "warning":
          return { bg: theme.warningColor, text: "#ffffff" };
        case "error":
          return { bg: theme.errorColor, text: "#ffffff" };
        case "info":
          return { bg: theme.infoColor, text: "#ffffff" };
        default:
          return { bg: theme.primaryColor, text: "#ffffff" };
      }
    };

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return { padding: "0.125rem 0.5rem", fontSize: "0.625rem" };
        case "lg":
          return { padding: "0.25rem 0.75rem", fontSize: "0.75rem" };
        case "xl":
          return { padding: "0.375rem 1rem", fontSize: "0.875rem" };
        default:
          return { padding: "0.25rem 0.75rem", fontSize: "0.75rem" };
      }
    };

    const colors = getVariantColors();
    const scaleStyles = getScaleStyles();

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium transition-all duration-200 ease-in-out hover:scale-105 cursor-default",
          pulse && "animate-pulse",
          className
        )}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          transform: isHovered ? "scale(1.05) translateY(-1px)" : "scale(1)",
          boxShadow: isHovered ? `0 4px 12px ${colors.bg}40` : "none",
          ...scaleStyles,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SheetBadge.displayName = "SheetBadge";

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBadge,
};
