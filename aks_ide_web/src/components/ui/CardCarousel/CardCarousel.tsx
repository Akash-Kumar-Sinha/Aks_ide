import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, type MotionStyle } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useTheme, { type Theme } from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

interface ExtendedMotionStyle extends MotionStyle {
  focusRingColor?: string;
}

interface ScaleStyles {
  borderRadius: string;
  padding: string;
  controlSize: string;
  controlIcon: number;
  indicator: string;
  activeIndicator: string;
  gap: string;
}

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

interface CarouselProps
  extends ExcludeMotionConflicts<React.HTMLAttributes<HTMLDivElement>> {
  children: React.ReactNode[];
  initialIndex?: number;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  className?: string;
  onSlideChange?: (index: number) => void;

  // Animation props
  animateOnMount?: boolean;
  slideDirection?: "horizontal" | "vertical";

  // Accessibility
  "aria-label"?: string;
  "aria-describedby"?: string;
}

const useScaleStyles = (scale: SpaceVariantType): ScaleStyles => {
  return useMemo(() => {
    const styles = {
      sm: {
        borderRadius: "6px",
        padding: "8px",
        controlSize: "h-6 w-6",
        controlIcon: 14,
        indicator: "h-1 w-1",
        activeIndicator: "h-1 w-4",
        gap: "4px",
      },
      lg: {
        borderRadius: "8px",
        padding: "12px",
        controlSize: "h-8 w-8",
        controlIcon: 16,
        indicator: "h-1.5 w-1.5",
        activeIndicator: "h-1.5 w-6",
        gap: "6px",
      },
      xl: {
        borderRadius: "12px",
        padding: "16px",
        controlSize: "h-10 w-10",
        controlIcon: 20,
        indicator: "h-2 w-2",
        activeIndicator: "h-2 w-8",
        gap: "8px",
      },
    };

    return styles[scale] || styles.lg;
  }, [scale]);
};

const useVariantStyles = (
  variant: DesignVariantType,
  theme: Theme,
  scale: SpaceVariantType
): React.CSSProperties => {
  const scaleStyles = useScaleStyles(scale);

  return useMemo(() => {
    const baseStyles = {
      borderRadius: scaleStyles.borderRadius,
      padding: scaleStyles.padding,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    switch (variant) {
      case "default":
        return {
          ...baseStyles,
          backgroundColor: theme.backgroundColor,
          border: `1px solid ${theme.secondaryColor}30`,
          boxShadow: `0 2px 8px -2px ${theme.secondaryShade}08, 0 1px 4px -1px ${theme.secondaryShade}06`,
        };

      case "minimal":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          padding: "0",
        };

      default:
        return {
          ...baseStyles,
          backgroundColor: theme.backgroundColor,
          border: `1px solid ${theme.secondaryColor}30`,
          boxShadow: `0 2px 8px -2px ${theme.secondaryShade}08, 0 1px 4px -1px ${theme.secondaryShade}06`,
        };
    }
  }, [variant, theme, scaleStyles]);
};

interface SlideVariants {
  enter: (direction: number) => { x?: number; y?: number; opacity: number };
  center: { x?: number; y?: number; opacity: number };
  exit: (direction: number) => { x?: number; y?: number; opacity: number };
  [key: string]:
    | ((direction: number) => { x?: number; y?: number; opacity: number })
    | { x?: number; y?: number; opacity: number };
}

interface AnimationVariants {
  horizontal: SlideVariants;
  vertical: SlideVariants;
}

const slideVariants: AnimationVariants = {
  horizontal: {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  },
  vertical: {
    enter: (direction: number) => ({
      y: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  },
};

const carouselVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      initialIndex = 0,
      autoPlay = false,
      interval = 5000,
      showControls = true,
      showIndicators = true,
      variant = "default",
      scale = "lg",
      className,
      onSlideChange,
      animateOnMount = true,
      slideDirection = "horizontal",
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const childrenArray: React.ReactNode[] = React.Children.toArray(children);
    const [activeIndex, setActiveIndex] = useState<number>(
      Math.max(0, Math.min(initialIndex, childrenArray.length - 1))
    );
    const [isHovered, setIsHovered] = useState(false);
    const [direction, setDirection] = useState(0);

    const scaleStyles: ScaleStyles = useScaleStyles(scale);
    const variantStyles: React.CSSProperties = useVariantStyles(
      variant,
      theme,
      scale
    );
    const currentSlideVariants: SlideVariants = slideVariants[slideDirection];

    const handleNext = useCallback((): void => {
      const newIndex = (activeIndex + 1) % childrenArray.length;
      setDirection(1);
      setActiveIndex(newIndex);
      onSlideChange?.(newIndex);
    }, [activeIndex, childrenArray.length, onSlideChange]);

    const handlePrev = useCallback((): void => {
      const newIndex =
        (activeIndex - 1 + childrenArray.length) % childrenArray.length;
      setDirection(-1);
      setActiveIndex(newIndex);
      onSlideChange?.(newIndex);
    }, [activeIndex, childrenArray.length, onSlideChange]);

    const goToSlide = useCallback(
      (index: number): void => {
        if (index === activeIndex) return;
        setDirection(index > activeIndex ? 1 : -1);
        setActiveIndex(index);
        onSlideChange?.(index);
      },
      [activeIndex, onSlideChange]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>): void => {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            handlePrev();
            break;
          case "ArrowRight":
            event.preventDefault();
            handleNext();
            break;
          case "ArrowUp":
            if (slideDirection === "vertical") {
              event.preventDefault();
              handlePrev();
            }
            break;
          case "ArrowDown":
            if (slideDirection === "vertical") {
              event.preventDefault();
              handleNext();
            }
            break;
        }
      },
      [handlePrev, handleNext, slideDirection]
    );

    useEffect((): (() => void) | void => {
      if (!autoPlay || isHovered || childrenArray.length <= 1) return;

      const timer = setInterval(handleNext, interval);
      return () => clearInterval(timer);
    }, [autoPlay, isHovered, interval, handleNext, childrenArray.length]);

    useEffect((): void => {
      if (activeIndex >= childrenArray.length) {
        setActiveIndex(Math.max(0, childrenArray.length - 1));
      }
    }, [childrenArray.length, activeIndex]);

    // Early return if no children
    if (!childrenArray.length) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-center", className)}
          style={{
            ...variantStyles,
            minHeight: "120px",
          }}
        >
          <p style={{ color: theme.textDimmed }}>No content to display</p>
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden focus:outline-none",
          className
        )}
        style={variantStyles as ExtendedMotionStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        initial={animateOnMount ? carouselVariants.initial : false}
        animate={animateOnMount ? carouselVariants.animate : {}}
        tabIndex={0}
        role="region"
        aria-label={ariaLabel || `Carousel with ${childrenArray.length} slides`}
        aria-describedby={ariaDescribedBy}
        aria-live="polite"
        {...props}
      >
        <div className="relative h-full w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={currentSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {childrenArray[activeIndex]}
            </motion.div>
          </AnimatePresence>
        </div>

        {showControls && childrenArray.length > 1 && (
          <CarouselControls
            onPrev={handlePrev}
            onNext={handleNext}
            theme={theme}
            scaleStyles={scaleStyles}
            slideDirection={slideDirection}
          />
        )}

        {showIndicators && childrenArray.length > 1 && (
          <CarouselIndicators
            count={childrenArray.length}
            activeIndex={activeIndex}
            onGoToSlide={goToSlide}
            theme={theme}
            scaleStyles={scaleStyles}
          />
        )}
      </motion.div>
    );
  }
);

interface CarouselControlsProps {
  onPrev: () => void;
  onNext: () => void;
  theme: Theme;
  scaleStyles: ScaleStyles;
  slideDirection: "horizontal" | "vertical";
}

const CarouselControls: React.FC<CarouselControlsProps> = ({
  onPrev,
  onNext,
  theme,
  scaleStyles,
  slideDirection,
}) => {
  const controlStyle: React.CSSProperties = {
    backgroundColor: `${theme.backgroundColor}95`,
    border: `1px solid ${theme.secondaryColor}30`,
    color: theme.textColor,
    backdropFilter: "blur(8px)",
  };

  const isVertical: boolean = slideDirection === "vertical";

  return (
    <>
      <motion.button
        className={cn(
          "absolute z-20 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none",
          scaleStyles.controlSize,
          isVertical
            ? "left-1/2 top-2 -translate-x-1/2"
            : "left-2 top-1/2 -translate-y-1/2"
        )}
        style={controlStyle}
        whileHover={{
          scale: 1.1,
          backgroundColor: `${theme.primaryColor}15`,
          borderColor: `${theme.primaryColor}40`,
        }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft
          size={scaleStyles.controlIcon}
          style={{
            transform: isVertical ? "rotate(90deg)" : "none",
          }}
        />
      </motion.button>

      <motion.button
        className={cn(
          "absolute z-20 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none",
          scaleStyles.controlSize,
          isVertical
            ? "bottom-2 left-1/2 -translate-x-1/2"
            : "right-2 top-1/2 -translate-y-1/2"
        )}
        style={controlStyle}
        whileHover={{
          scale: 1.1,
          backgroundColor: `${theme.primaryColor}15`,
          borderColor: `${theme.primaryColor}40`,
        }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next slide"
      >
        <ChevronRight
          size={scaleStyles.controlIcon}
          style={{
            transform: isVertical ? "rotate(90deg)" : "none",
          }}
        />
      </motion.button>
    </>
  );
};

interface CarouselIndicatorsProps {
  count: number;
  activeIndex: number;
  onGoToSlide: (index: number) => void;
  theme: Theme;
  scaleStyles: ScaleStyles;
}

const CarouselIndicators: React.FC<CarouselIndicatorsProps> = ({
  count,
  activeIndex,
  onGoToSlide,
  theme,
  scaleStyles,
}) => (
  <div
    className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2"
    style={{ gap: scaleStyles.gap }}
    role="tablist"
    aria-label="Carousel navigation"
  >
    {Array.from({ length: count }).map((_, index) => (
      <motion.button
        key={index}
        className={cn(
          "rounded-full transition-all duration-200 focus:outline-none",
          index === activeIndex
            ? scaleStyles.activeIndicator
            : scaleStyles.indicator
        )}
        style={{
          backgroundColor:
            index === activeIndex
              ? theme.primaryColor
              : `${theme.primaryColor}30`,
        }}
        whileHover={{ scale: 1.2 }}
        onClick={(e) => {
          e.stopPropagation();
          onGoToSlide(index);
        }}
        role="tab"
        aria-selected={index === activeIndex}
        aria-label={`Go to slide ${index + 1}`}
        tabIndex={index === activeIndex ? 0 : -1}
      />
    ))}
  </div>
);

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("h-full w-full", className)} {...props}>
    {children}
  </div>
));

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-full w-full flex-shrink-0", className)}
    {...props}
  >
    {children}
  </div>
));

Carousel.displayName = "Carousel";
CarouselContent.displayName = "CarouselContent";
CarouselItem.displayName = "CarouselItem";

export { Carousel, CarouselContent, CarouselItem, type CarouselProps };
