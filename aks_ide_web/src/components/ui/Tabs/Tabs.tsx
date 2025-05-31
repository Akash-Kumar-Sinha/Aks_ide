import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import useTheme, { type Theme } from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";
import "../lib/scroll.css"

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

// Custom CSS Properties interface for TypeScript
interface CustomCSSProperties extends React.CSSProperties {
  "--focus-ring-color"?: string;
  "--particle-count"?: number;
  "--wave-color"?: string;
  "--gradient-start"?: string;
  "--gradient-end"?: string;
}

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

type TabsProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  orientation?: "horizontal" | "vertical";
  animateOnMount?: boolean;
  glowEffect?: boolean;
  fullWidth?: boolean;
  rippleEffect?: boolean;
  morphingBackground?: boolean;
  particleEffect?: boolean;
  soundEnabled?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
};

type TabsListProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  centered?: boolean;
  floatingIndicator?: boolean;
  magneticEffect?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
};

type TabsTriggerProps = ExcludeMotionConflicts<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> & {
  children: React.ReactNode;
  value: string;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  pulseOnActive?: boolean;
  rotateIcon?: boolean;
  colorShift?: boolean;
};

type TabsContentProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  value: string;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  animateContent?: boolean;
  slideDirection?: "left" | "right" | "up" | "down";
  staggerChildren?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
};

// Context for managing tab state
const TabsContext = React.createContext<{
  activeValue: string;
  onValueChange: (value: string) => void;
  variant: DesignVariantType;
  scale: SpaceVariantType;
  orientation: "horizontal" | "vertical";
  glowEffect: boolean;
  rippleEffect: boolean;
  morphingBackground: boolean;
  particleEffect: boolean;
  soundEnabled: boolean;
  scrollable: boolean;
  scrollVariant: ScrollVariantType;
  scrollDirection: ScrollDirectionType;
} | null>(null);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
};

// Creative particle system component
const ParticleSystem: React.FC<{ isActive: boolean; theme: Theme }> = ({
  isActive,
  theme,
}) => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      opacity: number;
      velocity: { x: number; y: number };
    }>
  >([]);

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
      }));
      setParticles(newParticles);

      const interval = setInterval(() => {
        setParticles((prev) =>
          prev.map((particle) => ({
            ...particle,
            x: (particle.x + particle.velocity.x + 100) % 100,
            y: (particle.y + particle.velocity.y + 100) % 100,
            opacity: Math.max(0.1, particle.opacity - 0.01),
          }))
        );
      }, 50);

      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: theme.primaryColor,
            opacity: particle.opacity,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [
              particle.opacity,
              particle.opacity * 0.5,
              particle.opacity,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Ripple effect component
const RippleEffect: React.FC<{ trigger: boolean; theme: Theme }> = ({
  trigger,
  theme,
}) => {
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  useEffect(() => {
    if (trigger) {
      const newRipple = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              borderColor: theme.primaryColor,
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 100, height: 100, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      children,
      className,
      defaultValue = "",
      value,
      onValueChange,
      variant = "default",
      scale = "lg",
      orientation = "horizontal",
      animateOnMount = true,
      glowEffect = false,
      fullWidth = false,
      rippleEffect = false,
      morphingBackground = false,
      particleEffect = false,
      soundEnabled = false,
      scrollable = false,
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const activeValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);

      // Sound effect
      if (soundEnabled && typeof window !== "undefined") {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          400,
          audioContext.currentTime + 0.1
        );

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
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

    const contextValue = {
      activeValue,
      onValueChange: handleValueChange,
      variant,
      scale,
      orientation,
      glowEffect,
      rippleEffect,
      morphingBackground,
      particleEffect,
      soundEnabled,
      scrollable,
      scrollVariant,
      scrollDirection,
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <motion.div
          ref={ref}
          className={cn(
            "tabs-container relative",
            orientation === "vertical" && "flex gap-4",
            fullWidth && "w-full",
            scrollable && getScrollbarClasses(),
            className
          )}
          style={getScrollableStyles()}
          initial={animateOnMount ? { opacity: 0, y: 10, rotateX: -15 } : {}}
          animate={animateOnMount ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            damping: 20,
            stiffness: 100,
          }}
          {...props}
        >
          {children}
        </motion.div>
      </TabsContext.Provider>
    );
  }
);

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      children,
      className,
      variant: propVariant,
      scale: propScale,
      orientation: propOrientation,
      fullWidth: propFullWidth,
      centered = false,
      floatingIndicator = false,
      magneticEffect = false,
      scrollable: propScrollable,
      scrollVariant: propScrollVariant,
      scrollDirection: propScrollDirection,
      maxHeight: propMaxHeight,
      maxWidth: propMaxWidth,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { 
      variant, 
      scale, 
      orientation, 
      morphingBackground,
      scrollable: contextScrollable,
      scrollVariant: contextScrollVariant,
      scrollDirection: contextScrollDirection
    } = useTabsContext();
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const finalVariant = propVariant || variant;
    const finalScale = propScale || scale;
    const finalOrientation = propOrientation || orientation;
    const finalScrollable = propScrollable !== undefined ? propScrollable : contextScrollable;
    const finalScrollVariant = propScrollVariant || contextScrollVariant;
    const finalScrollDirection = propScrollDirection || contextScrollDirection;

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-100, 100], [2, -2]);
    const rotateY = useTransform(mouseX, [-100, 100], [-2, 2]);

    const handleMouseMove = (event: React.MouseEvent) => {
      if (!magneticEffect || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;

      mouseX.set(deltaX);
      mouseY.set(deltaY);
      setMousePosition({ x: deltaX, y: deltaY });
    };

    const getScaleStyles = () => {
      switch (finalScale) {
        case "sm":
          return {
            padding: "0.25rem",
            gap: "0.125rem",
            borderRadius: "0.375rem",
          };
        case "lg":
          return {
            padding: "0.375rem",
            gap: "0.25rem",
            borderRadius: "0.5rem",
          };
        case "xl":
          return {
            padding: "0.5rem",
            gap: "0.375rem",
            borderRadius: "0.75rem",
          };
        default:
          return {
            padding: "0.375rem",
            gap: "0.25rem",
            borderRadius: "0.5rem",
          };
      }
    };

    const getVariantStyles = (): CustomCSSProperties => {
      const baseStyles = getScaleStyles();

      switch (finalVariant) {
        case "default":
          return {
            ...baseStyles,
            backgroundColor: morphingBackground
              ? `linear-gradient(135deg, ${theme.secondaryColor}15, ${theme.primaryColor}08, ${theme.secondaryColor}15)`
              : `${theme.secondaryColor}15`,
            border: `1px solid ${theme.secondaryColor}30`,
            backdropFilter: "blur(12px)",
            boxShadow: isHovered
              ? `0 8px 24px ${theme.secondaryShade}20, 0 0 40px ${theme.primaryColor}10`
              : `0 4px 12px ${theme.secondaryShade}10`,
            "--gradient-start": `${theme.primaryColor}20`,
            "--gradient-end": `${theme.secondaryColor}20`,
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            border: `1px solid ${theme.secondaryColor}20`,
            boxShadow: "none",
          };

        default:
          return {
            ...baseStyles,
            backgroundColor: `${theme.secondaryColor}15`,
            border: `1px solid ${theme.secondaryColor}30`,
          };
      }
    };

    // Generate scrollbar class names
    const getScrollbarClasses = () => {
      if (!finalScrollable) return "";

      const classes = ["scrollable-container"];

      // Add variant-specific class
      if (finalScrollVariant !== "default") {
        classes.push(`scrollable-${finalScrollVariant}`);
      }

      // Add direction-specific class
      if (finalScrollDirection !== "none") {
        classes.push(`scroll-${finalScrollDirection}`);
      }

      // Add scale-specific class
      classes.push(`scrollable-${finalScale}`);

      // Add responsive class
      classes.push("scrollable-responsive");

      return classes.join(" ");
    };

    // Generate container styles for scrollable content
    const getScrollableStyles = () => {
      if (!finalScrollable) return {};

      const styles: React.CSSProperties = {};

      if (propMaxHeight) {
        styles.maxHeight =
          typeof propMaxHeight === "number" ? `${propMaxHeight}px` : propMaxHeight;
      }

      if (propMaxWidth) {
        styles.maxWidth =
          typeof propMaxWidth === "number" ? `${propMaxWidth}px` : propMaxWidth;
      }

      // Set overflow based on scroll direction
      switch (finalScrollDirection) {
        case "vertical":
          styles.overflowY = "auto";
          styles.overflowX = "hidden";
          if (!propMaxHeight) styles.maxHeight = "200px"; // Default max height for tab list
          break;
        case "horizontal":
          styles.overflowX = "auto";
          styles.overflowY = "hidden";
          break;
        case "both":
          styles.overflow = "auto";
          if (!propMaxHeight) styles.maxHeight = "200px";
          break;
        case "none":
        default:
          break;
      }

      return styles;
    };

    // Combine ref with containerRef
    React.useImperativeHandle(ref, () => containerRef.current!);

    return (
      <motion.div
        ref={containerRef}
        className={cn(
          "inline-flex items-center transition-all duration-500 relative overflow-hidden",
          finalOrientation === "horizontal" ? "flex-row" : "flex-col min-w-fit",
          propFullWidth && "w-full",
          centered && "justify-center",
          finalScrollable && getScrollbarClasses(),
          className
        )}
        style={{
          ...getVariantStyles(),
          ...getScrollableStyles(),
        }}
        animate={
          magneticEffect
            ? {
                rotateX: rotateX.get(),
                rotateY: rotateY.get(),
              }
            : {}
        }
        onMouseMove={handleMouseMove}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => {
          setIsHovered(false);
          mouseX.set(0);
          mouseY.set(0);
        }}
        role="tablist"
        aria-orientation={finalOrientation}
        {...props}
      >
        {/* Animated background gradient */}
        {morphingBackground && (
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                `linear-gradient(0deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`,
                `linear-gradient(90deg, ${theme.secondaryColor}10, ${theme.primaryColor}10)`,
                `linear-gradient(180deg, ${theme.primaryColor}10, ${theme.secondaryColor}10)`,
                `linear-gradient(270deg, ${theme.secondaryColor}10, ${theme.primaryColor}10)`,
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Floating indicator */}
        {floatingIndicator && isHovered && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: mousePosition.x + 50,
              top: mousePosition.y + 50,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: theme.primaryColor,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        )}

        {children}
      </motion.div>
    );
  }
);

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    {
      children,
      className,
      value,
      variant: propVariant,
      scale: propScale,
      disabled = false,
      icon,
      badge,
      pulseOnActive = false,
      rotateIcon = false,
      colorShift = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const {
      activeValue,
      onValueChange,
      variant,
      scale,
      orientation,
      glowEffect,
      rippleEffect,
      particleEffect,
    } = useTabsContext();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [rippleTrigger, setRippleTrigger] = useState(false);

    const finalVariant = propVariant || variant;
    const finalScale = propScale || scale;
    const isActive = activeValue === value;

    const getScaleStyles = () => {
      switch (finalScale) {
        case "sm":
          return {
            padding:
              orientation === "horizontal"
                ? "0.375rem 0.75rem"
                : "0.375rem 0.5rem",
            fontSize: "0.75rem",
            borderRadius: "0.25rem",
            minHeight: "2rem",
          };
        case "lg":
          return {
            padding:
              orientation === "horizontal" ? "0.5rem 1rem" : "0.5rem 0.75rem",
            fontSize: "0.875rem",
            borderRadius: "0.375rem",
            minHeight: "2.5rem",
          };
        case "xl":
          return {
            padding:
              orientation === "horizontal" ? "0.75rem 1.25rem" : "0.75rem 1rem",
            fontSize: "1rem",
            borderRadius: "0.5rem",
            minHeight: "3rem",
          };
        default:
          return {
            padding:
              orientation === "horizontal" ? "0.5rem 1rem" : "0.5rem 0.75rem",
            fontSize: "0.875rem",
            borderRadius: "0.375rem",
            minHeight: "2.5rem",
          };
      }
    };

    const getVariantStyles = (): CustomCSSProperties => {
      const baseStyles = getScaleStyles();

      const getActiveStyles = () => {
        if (isActive) {
          return {
            backgroundColor: colorShift
              ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
              : theme.backgroundColor,
            color: colorShift ? "#ffffff" : theme.primaryColor,
            boxShadow: glowEffect
              ? `0 0 20px ${theme.primaryColor}40, 0 4px 16px ${theme.primaryColor}25`
              : `0 4px 12px ${theme.primaryColor}20`,
            border: `1px solid ${theme.primaryColor}40`,
            fontWeight: "600",
            transform: pulseOnActive ? "scale(1.02)" : "scale(1)",
          };
        }

        return {
          backgroundColor: "transparent",
          color: isHovered ? theme.textColor : theme.textDimmed,
          border: "1px solid transparent",
          fontWeight: "500",
          transform: "scale(1)",
        };
      };

      switch (finalVariant) {
        case "default":
          return {
            ...baseStyles,
            ...getActiveStyles(),
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "--focus-ring-color": theme.primaryColor,
          };

        case "minimal":
          return {
            ...baseStyles,
            ...getActiveStyles(),
            backgroundColor: isActive
              ? `${theme.primaryColor}15`
              : "transparent",
            border: isActive
              ? `1px solid ${theme.primaryColor}40`
              : "1px solid transparent",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "--focus-ring-color": theme.primaryColor,
          };

        default:
          return {
            ...baseStyles,
            ...getActiveStyles(),
            "--focus-ring-color": theme.primaryColor,
          };
      }
    };

    const handleClick = () => {
      if (!disabled) {
        onValueChange(value);
        if (rippleEffect) {
          setRippleTrigger((prev) => !prev);
        }
      }
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap cursor-pointer overflow-hidden",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          orientation === "vertical" && "w-full justify-start",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        style={getVariantStyles()}
        initial={false}
        animate={{
          scale: isPressed
            ? 0.95
            : pulseOnActive && isActive
            ? [1, 1.05, 1]
            : 1,
          rotateZ: isActive && rotateIcon ? [0, 2, -2, 0] : 0,
        }}
        whileHover={
          !disabled
            ? {
                y: -2,
                boxShadow: `0 6px 20px ${theme.primaryColor}15`,
              }
            : {}
        }
        transition={{
          duration: pulseOnActive && isActive ? 0.6 : 0.2,
          ease: "easeOut",
          repeat: pulseOnActive && isActive ? Infinity : 0,
          repeatType: "reverse",
        }}
        onHoverStart={() => !disabled && setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onTapStart={() => setIsPressed(true)}
        onTap={() => setIsPressed(false)}
        onTapCancel={() => setIsPressed(false)}
        onClick={handleClick}
        disabled={disabled}
        role="tab"
        aria-selected={isActive}
        aria-controls={`tabpanel-${value}`}
        id={`tab-${value}`}
        tabIndex={isActive ? 0 : -1}
        {...props}
      >
        {/* Particle effect */}
        {particleEffect && <ParticleSystem isActive={isActive} theme={theme} />}

        {/* Ripple effect */}
        {rippleEffect && <RippleEffect trigger={rippleTrigger} theme={theme} />}

        {/* Active indicator with morphing animation */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-inherit"
              style={{
                background: colorShift
                  ? `linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}10, ${theme.primaryColor}15)`
                  : `linear-gradient(135deg, ${theme.primaryColor}08, ${theme.primaryColor}12)`,
                border: `1px solid ${theme.primaryColor}25`,
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                background: colorShift
                  ? [
                      `linear-gradient(0deg, ${theme.primaryColor}15, ${theme.secondaryColor}10)`,
                      `linear-gradient(180deg, ${theme.secondaryColor}10, ${theme.primaryColor}15)`,
                    ]
                  : undefined,
              }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              transition={{
                duration: 0.4,
                ease: "backOut",
                background: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                },
              }}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative flex items-center gap-2 z-10">
          {icon && (
            <motion.div
              className="flex-shrink-0"
              animate={
                rotateIcon && isActive
                  ? {
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
            >
              {icon}
            </motion.div>
          )}

          <span className="truncate">{children}</span>

          {badge && (
            <motion.div
              className="flex items-center justify-center min-w-5 h-5 text-xs font-medium rounded-full"
              style={{
                backgroundColor: theme.primaryColor,
                color: "#ffffff",
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
            >
              {badge}
            </motion.div>
          )}
        </div>

        {/* Focus ring */}
        <motion.div
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{
            boxShadow: `0 0 0 2px var(--focus-ring-color, ${theme.primaryColor})`,
            opacity: 0,
          }}
          animate={{
            opacity: isActive ? 0.3 : 0,
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.button>
    );
  }
);

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  (
    {
      children,
      className,
      value,
      variant: propVariant,
      scale: propScale,
      animateContent = true,
      slideDirection = "right",
      staggerChildren = false,
      scrollable: propScrollable,
      scrollVariant: propScrollVariant,
      scrollDirection: propScrollDirection,
      maxHeight: propMaxHeight,
      maxWidth: propMaxWidth,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const {
      activeValue,
      variant,
      scale,
      orientation,
      scrollable: contextScrollable,
      scrollVariant: contextScrollVariant,
      scrollDirection: contextScrollDirection,
    } = useTabsContext();

    const finalVariant = propVariant || variant;
    const finalScale = propScale || scale;
    const finalScrollable = propScrollable !== undefined ? propScrollable : contextScrollable;
    const finalScrollVariant = propScrollVariant || contextScrollVariant;
    const finalScrollDirection = propScrollDirection || contextScrollDirection;

    const isActive = activeValue === value;

    const getSlideVariants = () => {
      const directions = {
        left: { x: -20, opacity: 0 },
        right: { x: 20, opacity: 0 },
        up: { y: -20, opacity: 0 },
        down: { y: 20, opacity: 0 },
      };

      return {
        hidden: directions[slideDirection],
        visible: {
          x: 0,
          y: 0,
          opacity: 1,
          transition: {
            duration: 0.4,
            ease: "easeOut",
            ...(staggerChildren && {
              staggerChildren: 0.1,
              delayChildren: 0.1,
            }),
          },
        },
        exit: {
          ...directions[slideDirection],
          transition: { duration: 0.3, ease: "easeIn" },
        },
      };
    };

    const getScaleStyles = () => {
      switch (finalScale) {
        case "sm":
          return {
            padding: "0.75rem",
            borderRadius: "0.375rem",
          };
        case "lg":
          return {
            padding: "1rem",
            borderRadius: "0.5rem",
          };
        case "xl":
          return {
            padding: "1.25rem",
            borderRadius: "0.75rem",
          };
        default:
          return {
            padding: "1rem",
            borderRadius: "0.5rem",
          };
      }
    };

    const getVariantStyles = () => {
      const baseStyles = getScaleStyles();

      switch (finalVariant) {
        case "default":
          return {
            ...baseStyles,
            backgroundColor: `${theme.backgroundColor}50`,
            border: `1px solid ${theme.secondaryColor}20`,
            backdropFilter: "blur(8px)",
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            border: "none",
            padding: finalScale === "sm" ? "0.5rem 0" : "0.75rem 0",
          };

        default:
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            border: `1px solid ${theme.secondaryColor}30`,
          };
      }
    };

    // Generate scrollbar class names
    const getScrollbarClasses = () => {
      if (!finalScrollable) return "";

      const classes = ["scrollable-container"];

      // Add variant-specific class
      if (finalScrollVariant !== "default") {
        classes.push(`scrollable-${finalScrollVariant}`);
      }

      // Add direction-specific class
      if (finalScrollDirection !== "none") {
        classes.push(`scroll-${finalScrollDirection}`);
      }

      // Add scale-specific class
      classes.push(`scrollable-${finalScale}`);

      // Add responsive class
      classes.push("scrollable-responsive");

      return classes.join(" ");
    };

    // Generate container styles for scrollable content
    const getScrollableStyles = () => {
      if (!finalScrollable) return {};

      const styles: React.CSSProperties = {};

      if (propMaxHeight) {
        styles.maxHeight =
          typeof propMaxHeight === "number" ? `${propMaxHeight}px` : propMaxHeight;
      }

      if (propMaxWidth) {
        styles.maxWidth =
          typeof propMaxWidth === "number" ? `${propMaxWidth}px` : propMaxWidth;
      }

      // Set overflow based on scroll direction
      switch (finalScrollDirection) {
        case "vertical":
          styles.overflowY = "auto";
          styles.overflowX = "hidden";
          if (!propMaxHeight) styles.maxHeight = "400px"; // Default max height for content
          break;
        case "horizontal":
          styles.overflowX = "auto";
          styles.overflowY = "hidden";
          styles.whiteSpace = "nowrap";
          break;
        case "both":
          styles.overflow = "auto";
          if (!propMaxHeight) styles.maxHeight = "400px";
          break;
        case "none":
        default:
          break;
      }

      return styles;
    };

    if (!isActive) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          ref={ref}
          className={cn(
            "focus:outline-none transition-all duration-300",
            orientation === "vertical" && "flex-1",
            finalScrollable && getScrollbarClasses(),
            className
          )}
          style={{
            ...getVariantStyles(),
            ...getScrollableStyles(),
          }}
          variants={animateContent ? getSlideVariants() : {}}
          initial={animateContent ? "hidden" : {}}
          animate={animateContent ? "visible" : {}}
          exit={animateContent ? "exit" : {}}
          role="tabpanel"
          aria-labelledby={`tab-${value}`}
          id={`tabpanel-${value}`}
          tabIndex={0}
          {...props}
        >
          {staggerChildren ? (
            <motion.div
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {React.Children.map(children, (child, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {child}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            children
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
);

// Display names for better debugging
Tabs.displayName = "Tabs";
TabsList.displayName = "TabsList";
TabsTrigger.displayName = "TabsTrigger";
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };