import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Maximize2 } from "lucide-react";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

// Import the scrollbar styles
import "../lib/scroll.css"; // Adjust path as needed

// Helper type to exclude conflicting events between React and Framer Motion
type ExcludeMotionConflicts<T> = Omit<
  T,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragExit"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
>;

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

type CardProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  interactive?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  glowEffect?: boolean;
  animateOnMount?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
  enableKeyboardScroll?: boolean; // Changed prop name to be more explicit
  onClick?: () => void;
};

type CardHeaderProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  showBorder?: boolean;
  scale?: SpaceVariantType;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
};

type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  scale?: SpaceVariantType;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
  enableKeyboardScroll?: boolean; // Changed prop name to be more explicit
};

type CardFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  showBorder?: boolean;
  scale?: SpaceVariantType;
  sticky?: boolean;
};

type CardTitleProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLHeadingElement>
> & {
  children: React.ReactNode;
  gradient?: boolean;
  scale?: SpaceVariantType;
};

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  children: React.ReactNode;
  scale?: SpaceVariantType;
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = "default",
      scale = "lg",
      interactive = false,
      collapsible = false,
      defaultExpanded = true,
      glowEffect = false,
      animateOnMount = true,
      scrollable = false,
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      enableKeyboardScroll = false, // Default to false - keyboard scrolling disabled
      onClick,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const handleCardClick = () => {
      // Only handle regular onClick, not collapsible functionality
      if (onClick) {
        onClick();
      }
    };

    const handleCollapseToggle = () => {
      setIsExpanded(!isExpanded);
    };

    // Handler to prevent keyboard scrolling
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!enableKeyboardScroll && scrollable) {
        // Prevent arrow keys, page up/down, home/end from scrolling
        const preventKeys = [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          "Space",
        ];

        if (preventKeys.includes(e.key)) {
          e.preventDefault();
        }
      }
    };

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return {
            borderRadius: "0.5rem",
            padding: "0.75rem",
          };
        case "lg":
          return {
            borderRadius: "0.75rem",
            padding: "1rem",
          };
        case "xl":
          return {
            borderRadius: "1rem",
            padding: "1.25rem",
          };
        default:
          return {
            borderRadius: "0.75rem",
            padding: "1rem",
          };
      }
    };

    const getVariantStyles = () => {
      const baseStyles = getScaleStyles();

      switch (variant) {
        case "default":
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}40`,
            boxShadow:
              isHovered && interactive
                ? `0 8px 16px -4px ${theme.secondaryShade}30`
                : `0 2px 4px -1px ${theme.secondaryShade}20`,
            ...(glowEffect && {
              boxShadow: `0 0 20px ${theme.primaryColor}20, ${
                isHovered && interactive
                  ? `0 8px 16px -4px ${theme.secondaryShade}30`
                  : `0 2px 4px -1px ${theme.secondaryShade}20`
              }`,
            }),
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}20`,
            boxShadow: "none",
          };

        default:
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}40`,
            boxShadow: `0 2px 4px -1px ${theme.secondaryShade}20`,
          };
      }
    };

    // Generate scrollbar class names
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

    // Split children to handle collapsible content
    const childrenArray = React.Children.toArray(children);
    let headerContent: React.ReactNode = null;
    const bodyContent: React.ReactNode[] = [];
    let footerContent: React.ReactNode = null;

    childrenArray.forEach((child) => {
      if (React.isValidElement(child)) {
        if (child.type === CardHeader) {
          // Clone header with collapsible props
          headerContent = React.cloneElement(
            child as React.ReactElement<CardHeaderProps>,
            {
              ...child.props,
              collapsible,
              isExpanded,
              onToggle: handleCollapseToggle,
            }
          );
        } else if (child.type === CardFooter) {
          footerContent = child;
        } else if (child.type === CardContent) {
          // Pass enableKeyboardScroll prop to CardContent
          bodyContent.push(
            React.cloneElement(child as React.ReactElement<CardContentProps>, {
              ...child.props,
              enableKeyboardScroll,
            })
          );
        } else {
          bodyContent.push(child);
        }
      } else {
        bodyContent.push(child);
      }
    });

    return (
      <motion.div
        ref={ref}
        className={cn(
          "transition-all duration-300 overflow-hidden",
          (interactive || (onClick && !collapsible)) && "cursor-pointer",
          scrollable && getScrollbarClasses(),
          className
        )}
        style={{
          ...getVariantStyles(),
          ...getScrollableStyles(),
        }}
        initial={animateOnMount ? { opacity: 0, y: 20 } : {}}
        animate={animateOnMount ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={interactive ? { scale: 1.02, y: -2 } : {}}
        whileTap={
          interactive || (onClick && !collapsible) ? { scale: 0.98 } : {}
        }
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown} // Add keyboard event handler
        tabIndex={scrollable && !enableKeyboardScroll ? -1 : undefined} // Remove from tab order if keyboard scrolling disabled
        {...props}
      >
        {/* Always show header */}
        {headerContent}

        {/* Collapsible content */}
        <AnimatePresence initial={false}>
          {(isExpanded || !collapsible) && (
            <motion.div
              initial={collapsible ? { height: 0, opacity: 0 } : {}}
              animate={collapsible ? { height: "auto", opacity: 1 } : {}}
              exit={collapsible ? { height: 0, opacity: 0 } : {}}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              {bodyContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Always show footer */}
        {footerContent}
      </motion.div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      children,
      className,
      showBorder = true,
      scale = "lg",
      collapsible = false,
      isExpanded = true,
      onToggle,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    // Reduced padding for header
    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0.5rem 0.75rem 0.375rem 0.75rem"; // Reduced bottom padding
        case "lg":
          return "0.75rem 1rem 0.5rem 1rem"; // Reduced bottom padding
        case "xl":
          return "1rem 1.25rem 0.75rem 1.25rem"; // Reduced bottom padding
        default:
          return "0.75rem 1rem 0.5rem 1rem"; // Reduced bottom padding
      }
    };

    const handleToggleClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent event bubbling
      if (onToggle) {
        onToggle();
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn("transition-all duration-200 relative", className)}
        style={{
          padding: getPadding(),
          borderBottom: showBorder
            ? `1px solid ${theme.secondaryColor}20`
            : "none",
          backgroundColor: isHovered
            ? `${theme.primaryColor}05`
            : "transparent",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">{children}</div>

          {/* Toggle button for collapsible cards */}
          {collapsible && (
            <motion.button
              className="flex items-center justify-center ml-3 p-1 rounded-md transition-all duration-200 hover:bg-opacity-10"
              style={{
                color: theme.primaryColor,
                backgroundColor: "transparent",
              }}
              whileHover={{
                scale: 1.1,
                backgroundColor: `${theme.primaryColor}10`,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleClick}
              title={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  (
    {
      children,
      className,
      scale = "lg",
      scrollable = false,
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      enableKeyboardScroll = false, // Default to false - keyboard scrolling disabled
      ...props
    },
    ref
  ) => {
    // Handler to prevent keyboard scrolling in CardContent
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!enableKeyboardScroll && scrollable) {
        // Prevent arrow keys, page up/down, home/end from scrolling
        const preventKeys = [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          "Space",
        ];

        if (preventKeys.includes(e.key)) {
          e.preventDefault();
        }
      }
    };

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

    // Generate scrollbar classes for content
    const getContentScrollbarClasses = () => {
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

    // Generate styles for scrollable content
    const getContentScrollableStyles = () => {
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
          if (!maxHeight) styles.maxHeight = "300px"; // Default max height
          break;
        case "horizontal":
          styles.overflowX = "auto";
          styles.overflowY = "hidden";
          styles.whiteSpace = "nowrap";
          break;
        case "both":
          styles.overflow = "auto";
          if (!maxHeight) styles.maxHeight = "300px";
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
          "transition-all duration-200",
          scrollable && getContentScrollbarClasses(),
          className
        )}
        style={{
          padding: getPadding(),
          ...getContentScrollableStyles(),
        }}
        onKeyDown={handleKeyDown} // Add keyboard event handler
        tabIndex={scrollable && !enableKeyboardScroll ? -1 : undefined} // Remove from tab order if keyboard scrolling disabled
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  (
    {
      children,
      className,
      showBorder = true,
      scale = "lg",
      sticky = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Reduced padding for footer
    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0.375rem 0.75rem 0.5rem 0.75rem"; // Reduced top padding
        case "lg":
          return "0.5rem 1rem 0.75rem 1rem"; // Reduced top padding
        case "xl":
          return "0.75rem 1.25rem 1rem 1.25rem"; // Reduced top padding
        default:
          return "0.5rem 1rem 0.75rem 1rem"; // Reduced top padding
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-200",
          sticky && "sticky bottom-0 backdrop-blur-sm",
          className
        )}
        style={{
          padding: getPadding(),
          borderTop: showBorder
            ? `1px solid ${theme.secondaryColor}20`
            : "none",
          backgroundColor: sticky
            ? `${theme.backgroundColor}90`
            : "transparent",
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, gradient = false, scale = "lg", ...props }, ref) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

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
      <motion.h3
        ref={ref}
        className={cn(
          "font-semibold leading-tight tracking-tight transition-all duration-200",
          className
        )}
        style={{
          fontSize: getFontSize(),
          color: gradient ? undefined : theme.textColor,
          transform: isHovered ? "scale(1.02)" : "scale(1)",
          transformOrigin: "left",
          ...gradientStyle,
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </motion.h3>
    );
  }
);

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ children, className, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();

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
    <p
      ref={ref}
      className={cn("transition-all duration-200", className)}
      style={{
        fontSize: getFontSize(),
        color: theme.textDimmed,
        lineHeight: "1.5",
      }}
      {...props}
    >
      {children}
    </p>
  );
});

// Additional utility components
const CardBadge = React.forwardRef<
  HTMLDivElement,
  ExcludeMotionConflicts<React.HTMLAttributes<HTMLDivElement>> & {
    children: React.ReactNode;
    variant?:
      | "primary"
      | "secondary"
      | "success"
      | "warning"
      | "error"
      | "info";
    scale?: SpaceVariantType;
  }
>(
  (
    { children, className, variant = "primary", scale = "lg", ...props },
    ref
  ) => {
    const { theme } = useTheme();

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
      <motion.div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium transition-all duration-200",
          className
        )}
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          ...scaleStyles,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardBadge.displayName = "CardBadge";

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardBadge,
};