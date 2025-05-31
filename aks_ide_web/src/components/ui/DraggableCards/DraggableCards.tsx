import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  useVelocity,
  useAnimationControls,
  AnimatePresence,
} from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

// Import the scrollbar styles
import "../lib/scroll.css";

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

type CardDragProps = ExcludeMotionConflicts<
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
  draggable?: boolean;
  tiltEffect?: boolean;
  glareEffect?: boolean;
  bounceOnDrop?: boolean;
  constrainDrag?: boolean;
  onClick?: () => void;
};

type CardDragContainerProps = {
  className?: string;
  children?: React.ReactNode;
  perspective?: number;
};

type CardDragHeaderProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  showBorder?: boolean;
  scale?: SpaceVariantType;
};

type CardDragContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  scale?: SpaceVariantType;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
};

type CardDragFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  showBorder?: boolean;
  scale?: SpaceVariantType;
  sticky?: boolean;
};

type CardDragTitleProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLHeadingElement>
> & {
  children: React.ReactNode;
  gradient?: boolean;
  scale?: SpaceVariantType;
};

type CardDragDescriptionProps = React.HTMLAttributes<HTMLParagraphElement> & {
  children: React.ReactNode;
  scale?: SpaceVariantType;
};

const CardDrag = React.forwardRef<HTMLDivElement, CardDragProps>(
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
      draggable = true,
      tiltEffect = true,
      glareEffect = true,
      bounceOnDrop = true,
      constrainDrag = true,
      onClick,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [constraints, setConstraints] = useState({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });

    const cardRef = useRef<R>(null);
    const controls = useAnimationControls();

    // Mouse tracking for tilt effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Physics for drag interactions
    const velocityX = useVelocity(mouseX);
    const velocityY = useVelocity(mouseY);

    const springConfig = {
      stiffness: 100,
      damping: 20,
      mass: 0.5,
    };

    // Tilt transforms
    const rotateX = useSpring(
      useTransform(mouseY, [-300, 300], [25, -25]),
      springConfig
    );
    const rotateY = useSpring(
      useTransform(mouseX, [-300, 300], [-25, 25]),
      springConfig
    );

    // Opacity and glare effects
    const opacity = useSpring(
      useTransform(mouseX, [-300, 0, 300], [0.8, 1, 0.8]),
      springConfig
    );

    const glareOpacity = useSpring(
      useTransform(mouseX, [-300, 0, 300], [0.2, 0, 0.2]),
      springConfig
    );

    useEffect(() => {
      const updateConstraints = () => {
        if (typeof window !== "undefined" && constrainDrag) {
          setConstraints({
            top: -window.innerHeight / 3,
            left: -window.innerWidth / 3,
            right: window.innerWidth / 3,
            bottom: window.innerHeight / 3,
          });
        }
      };

      updateConstraints();
      window.addEventListener("resize", updateConstraints);

      return () => {
        window.removeEventListener("resize", updateConstraints);
      };
    }, [constrainDrag]);

    const handleClick = () => {
      if (collapsible) {
        setIsExpanded(!isExpanded);
      }
      if (onClick) {
        onClick();
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltEffect) return;

      const { clientX, clientY } = e;
      const { width, height, left, top } =
        cardRef.current?.getBoundingClientRect() ?? {
          width: 0,
          height: 0,
          left: 0,
          top: 0,
        };
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      mouseX.set(deltaX);
      mouseY.set(deltaY);
    };

    const handleMouseLeave = () => {
      if (tiltEffect) {
        mouseX.set(0);
        mouseY.set(0);
      }
    };

    const handleDragStart = () => {
      if (draggable) {
        document.body.style.cursor = "grabbing";
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any, info: any) => {
      if (!draggable) return;

      document.body.style.cursor = "default";

      if (tiltEffect) {
        controls.start({
          rotateX: 0,
          rotateY: 0,
          transition: {
            type: "spring",
            ...springConfig,
          },
        });
      }

      if (bounceOnDrop) {
        const currentVelocityX = velocityX.get();
        const currentVelocityY = velocityY.get();

        const velocityMagnitude = Math.sqrt(
          currentVelocityX * currentVelocityX +
            currentVelocityY * currentVelocityY
        );
        const bounce = Math.min(0.8, velocityMagnitude / 1000);

        animate(info.point.x, info.point.x + currentVelocityX * 0.3, {
          duration: 0.8,
          ease: [0.2, 0, 0, 1],
          bounce,
          type: "spring",
          stiffness: 50,
          damping: 15,
          mass: 0.8,
        });

        animate(info.point.y, info.point.y + currentVelocityY * 0.3, {
          duration: 0.8,
          ease: [0.2, 0, 0, 1],
          bounce,
          type: "spring",
          stiffness: 50,
          damping: 15,
          mass: 0.8,
        });
      }
    };

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return {
            borderRadius: "0.5rem",
            padding: "0.75rem",
            minHeight: "20rem",
            minWidth: "16rem",
          };
        case "lg":
          return {
            borderRadius: "0.75rem",
            padding: "1rem",
            minHeight: "24rem",
            minWidth: "20rem",
          };
        case "xl":
          return {
            borderRadius: "1rem",
            padding: "1.25rem",
            minHeight: "28rem",
            minWidth: "24rem",
          };
        default:
          return {
            borderRadius: "0.75rem",
            padding: "1rem",
            minHeight: "24rem",
            minWidth: "20rem",
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
                ? `0 12px 24px -8px ${theme.secondaryShade}40, 0 4px 8px -2px ${theme.secondaryShade}20`
                : `0 4px 8px -2px ${theme.secondaryShade}30, 0 2px 4px -1px ${theme.secondaryShade}20`,
            ...(glowEffect && {
              boxShadow: `0 0 30px ${theme.primaryColor}20, ${
                isHovered && interactive
                  ? `0 12px 24px -8px ${theme.secondaryShade}40`
                  : `0 4px 8px -2px ${theme.secondaryShade}30`
              }`,
            }),
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}20`,
            boxShadow:
              isHovered && interactive
                ? `0 8px 16px -4px ${theme.secondaryShade}20`
                : "none",
          };

        default:
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}40`,
            boxShadow: `0 4px 8px -2px ${theme.secondaryShade}30`,
          };
      }
    };

    // Generate scrollbar class names
    const getScrollbarClasses = () => {
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
        if (child.type === CardDragHeader) {
          headerContent = child;
        } else if (child.type === CardDragFooter) {
          footerContent = child;
        } else {
          bodyContent.push(child);
        }
      } else {
        bodyContent.push(child);
      }
    });

    const motionProps = draggable
      ? {
          drag: true,
          dragConstraints: constrainDrag ? constraints : undefined,
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
          whileDrag: { scale: 1.05, cursor: "grabbing" },
        }
      : {};

    const tiltProps = tiltEffect
      ? {
          style: {
            rotateX,
            rotateY,
            opacity,
            willChange: "transform",
            ...getVariantStyles(),
            ...getScrollableStyles(),
          },
        }
      : {
          style: {
            ...getVariantStyles(),
            ...getScrollableStyles(),
          },
        };

    return (
      <motion.div
        ref={(node) => {
          cardRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          "relative overflow-hidden transition-all duration-300 transform-gpu",
          (interactive || collapsible || draggable) && "cursor-pointer",
          draggable && "cursor-grab",
          scrollable && getScrollbarClasses(),
          className
        )}
        initial={animateOnMount ? { opacity: 0, y: 20, scale: 0.9 } : {}}
        animate={animateOnMount ? { opacity: 1, y: 0, scale: 1 } : controls}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={
          interactive
            ? { scale: 1.02, y: -4 }
            : draggable
            ? { scale: 1.01, y: -2 }
            : {}
        }
        whileTap={
          interactive || collapsible || draggable ? { scale: 0.98 } : {}
        }
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={collapsible ? handleClick : onClick}
        {...motionProps}
        {...tiltProps}
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

        {/* Collapsible toggle button */}
        {collapsible && (
          <motion.div
            className="flex justify-center mt-2 pt-2"
            style={{ borderTop: `1px solid ${theme.secondaryColor}20` }}
            onClick={handleClick}
          >
            <motion.div
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: theme.primaryColor }}
              whileHover={{ scale: 1.05 }}
            >
              {isExpanded ? (
                <>
                  <span>Collapse</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>Expand</span>
                  <ChevronDown size={14} />
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Glare effect overlay */}
        {glareEffect && (
          <motion.div
            className="pointer-events-none absolute inset-0 select-none"
            style={{
              opacity: glareOpacity,
              background: `linear-gradient(135deg, ${theme.primaryColor}10, transparent, ${theme.secondaryColor}10)`,
            }}
          />
        )}
      </motion.div>
    );
  }
);

const CardDragContainer = React.forwardRef<
  HTMLDivElement,
  CardDragContainerProps
>(({ className, children, perspective = 3000 }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("transform-3d", className)}
      style={{ perspective: `${perspective}px` }}
    >
      {children}
    </div>
  );
});

const CardDragHeader = React.forwardRef<HTMLDivElement, CardDragHeaderProps>(
  ({ children, className, showBorder = true, scale = "lg", ...props }, ref) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

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

    return (
      <motion.div
        ref={ref}
        className={cn("transition-all duration-200", className)}
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
        {children}
      </motion.div>
    );
  }
);

const CardDragContent = React.forwardRef<HTMLDivElement, CardDragContentProps>(
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
          if (!maxHeight) styles.maxHeight = "300px";
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
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardDragFooter = React.forwardRef<HTMLDivElement, CardDragFooterProps>(
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

const CardDragTitle = React.forwardRef<HTMLHeadingElement, CardDragTitleProps>(
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

const CardDragDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDragDescriptionProps
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

// Additional utility component for badges
const CardDragBadge = React.forwardRef<
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

CardDrag.displayName = "CardDrag";
CardDragContainer.displayName = "CardDragContainer";
CardDragHeader.displayName = "CardDragHeader";
CardDragContent.displayName = "CardDragContent";
CardDragFooter.displayName = "CardDragFooter";
CardDragTitle.displayName = "CardDragTitle";
CardDragDescription.displayName = "CardDragDescription";
CardDragBadge.displayName = "CardDragBadge";

export {
  CardDrag,
  CardDragContainer,
  CardDragHeader,
  CardDragContent,
  CardDragFooter,
  CardDragTitle,
  CardDragDescription,
  CardDragBadge,
};
