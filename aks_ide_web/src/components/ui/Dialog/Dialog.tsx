import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import useTheme from "../lib/useTheme";
import { createPortal } from 'react-dom';
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";
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

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
};

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  animateOnMount?: boolean;
  resizable?: boolean;
  onMaximizeChange?: (isMaximized: boolean) => void;
  audioFeedback?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
  defaultOpen?: boolean;
};

type DialogOverlayProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
  variant?: DesignVariantType;
  blurStrength?: "none" | "subtle" | "medium" | "strong";
};

type DialogContentProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  showCloseButton?: boolean;
  onClose?: () => void;
  animateOnMount: boolean;
  resizable?: boolean;
  onMaximizeChange?: (isMaximized: boolean) => void;
  audioFeedback?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
};

type DialogHeaderProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  showBorder?: boolean;
  scale?: SpaceVariantType;
  isMaximized?: boolean;
};

type DialogBodyProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  scale?: SpaceVariantType;
  isMaximized?: boolean;
  scrollable?: boolean;
  scrollVariant?: ScrollVariantType;
  scrollDirection?: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
};

type DialogFooterProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLDivElement>
> & {
  children: React.ReactNode;
  showBorder?: boolean;
  scale?: SpaceVariantType;
  sticky?: boolean;
  isMaximized?: boolean;
};

type DialogTitleProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLHeadingElement>
> & {
  children: React.ReactNode;
  gradient?: boolean;
  scale?: SpaceVariantType;
};

type DialogDescriptionProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLParagraphElement>
> & {
  children: React.ReactNode;
  scale?: SpaceVariantType;
};

// Simple sound hook implementation
interface SoundHook {
  playTransition: (sound: string) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

type DialogTriggerProps = ExcludeMotionConflicts<
  React.HTMLAttributes<HTMLElement>
> & {
  children: React.ReactNode;
  asChild?: boolean;
};

const useSound = (): SoundHook => {
  const [isMuted, setIsMuted] = React.useState(false);

  const playTransition = React.useCallback(
    (sound: string) => {
      if (isMuted) return;

      const sounds: Record<string, () => void> = {
        open: () => console.log("Playing open sound"),
        close: () => console.log("Playing close sound"),
        maximize: () => console.log("Playing maximize sound"),
        minimize: () => console.log("Playing minimize sound"),
        overlay: () => console.log("Playing overlay sound"),
      };

      if (sounds[sound]) {
        sounds[sound]();
      }
    },
    [isMuted]
  );

  const toggleMute = React.useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return { playTransition, toggleMute, isMuted };
};

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
  (
    {
      className,
      onClose,
      closeOnOutsideClick = true,
      variant = "default",
      blurStrength = "medium",
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const handleClick = (e: React.MouseEvent) => {
      if (closeOnOutsideClick && e.target === e.currentTarget && onClose) {
        onClose();
      }
    };

    const blurValues = {
      none: "0px",
      subtle: "2px",
      medium: "8px",
      strong: "16px",
    };

    const getOverlayStyles = () => {
      switch (variant) {
        case "minimal":
          return {
            backgroundColor: `${theme.backgroundColor}60`,
            backdropFilter: `blur(${blurValues[blurStrength]})`,
          };
        case "default":
        default:
          return {
            backgroundColor: `${theme.backgroundColor}80`,
            backdropFilter: `blur(${blurValues[blurStrength]})`,
          };
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center", // Ensure this is viewport-relative
          "w-screen h-screen", // Explicitly set to viewport dimensions
          className
        )}
        style={{
          position: "fixed", // Double ensure fixed positioning
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          ...getOverlayStyles(),
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={handleClick}
        {...props}
      />
    );
  }
);

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  (
    {
      children,
      className,
      variant = "default",
      scale = "lg",
      showCloseButton = true,
      onClose,
      animateOnMount = true,
      resizable = false,
      onMaximizeChange,
      audioFeedback = false,
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
    const { playTransition, toggleMute, isMuted } = useSound();
    const [isMaximized, setIsMaximized] = useState(false);
    const { onOpenChange } = useDialogContext();

    React.useEffect(() => {
      if (audioFeedback) {
        playTransition("open");
      }
    }, [audioFeedback, playTransition]);

    React.useEffect(() => {
      if (onMaximizeChange) {
        onMaximizeChange(isMaximized);
      }
    }, [isMaximized, onMaximizeChange]);

    const toggleMaximize = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMaximized(!isMaximized);
      if (audioFeedback) {
        playTransition(isMaximized ? "minimize" : "maximize");
      }
    };

    const handleClose = () => {
      if (audioFeedback) {
        playTransition("close");
      }
      if (onClose) {
        onClose();
      }
      onOpenChange(false);
    };

    const getInitialAnimation = () => {
      if (!animateOnMount) {
        return { opacity: 1, scale: 1, y: 0 };
      }
      return { opacity: 0, scale: 0.95, y: 20 };
    };

    const getAnimateAnimation = () => {
      return { opacity: 1, scale: 1, y: 0 };
    };

    const getExitAnimation = () => {
      if (!animateOnMount) {
        return { opacity: 0 };
      }
      return { opacity: 0, scale: 0.95, y: 20 };
    };

    const getScaleStyles = () => {
      if (isMaximized) {
        return {
          borderRadius: "0.75rem",
          padding: "2rem",
          maxWidth: "95vw",
          width: "95vw",
          height: "90vh",
        };
      }

      switch (scale) {
        case "sm":
          return {
            borderRadius: "0.5rem",
            padding: "1rem",
            maxWidth: "400px",
            width: "90vw",
          };
        case "lg":
          return {
            borderRadius: "0.75rem",
            padding: "1.5rem",
            maxWidth: "500px",
            width: "90vw",
          };
        case "xl":
          return {
            borderRadius: "1rem",
            padding: "2rem",
            maxWidth: "600px",
            width: "90vw",
          };
        default:
          return {
            borderRadius: "0.75rem",
            padding: "1.5rem",
            maxWidth: "500px",
            width: "90vw",
          };
      }
    };

    const getVariantStyles = () => {
      const baseStyles = getScaleStyles();

      // Only apply maxHeight when scrollable
      const scrollStyles = scrollable
        ? {
            maxHeight: isMaximized ? "90vh" : "70vh",
          }
        : {};

      switch (variant) {
        case "minimal":
          return {
            ...baseStyles,
            ...scrollStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}20`,
            boxShadow: `0 4px 6px -1px ${theme.secondaryShade}10`,
          };
        case "default":
        default:
          return {
            ...baseStyles,
            ...scrollStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${theme.secondaryColor}40`,
            boxShadow: `0 10px 15px -3px ${theme.secondaryShade}20, 0 4px 6px -2px ${theme.secondaryShade}10`,
          };
      }
    };

    // Split children to handle different sections and pass props
    const childrenArray = React.Children.toArray(children);
    let headerContent: React.ReactNode = null;
    const bodyContent: React.ReactNode[] = [];
    let footerContent: React.ReactNode = null;

    childrenArray.forEach((child) => {
      if (React.isValidElement(child)) {
        if (child.type === DialogHeader) {
          headerContent = React.cloneElement(child, {
            ...child.props,
            isMaximized,
          });
        } else if (child.type === DialogFooter) {
          footerContent = React.cloneElement(child, {
            ...child.props,
            isMaximized,
          });
        } else if (child.type === DialogBody) {
          bodyContent.push(
            React.cloneElement(child, {
              ...child.props,
              isMaximized,
              scrollable,
              scrollVariant,
              scrollDirection,
              maxHeight,
              maxWidth,
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
          "relative flex flex-col",
          resizable && !isMaximized && "resize overflow-auto",
          className
        )}
        style={{
          ...getVariantStyles(),
          position: "relative", // Ensure this isn't affected by parent transforms
          transform: "none", // Reset any inherited transforms
        }}
        initial={getInitialAnimation()}
        animate={getAnimateAnimation()}
        exit={getExitAnimation()}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          mass: 0.5,
        }}
        onClick={(e) => e.stopPropagation()}
        layout
        {...props}
      >
        {/* Header */}
        {headerContent}

        {/* Body Content - This is the ONLY scrollable area */}
        <DialogBodyWrapper
          isMaximized={isMaximized}
          scrollable={scrollable}
          scrollVariant={scrollVariant}
          scrollDirection={scrollDirection}
          maxHeight={maxHeight}
          maxWidth={maxWidth}
          scale={scale}
        >
          {bodyContent}
        </DialogBodyWrapper>

        {/* Footer */}
        {footerContent}

        {/* Control Buttons */}
        <motion.div
          layout
          className="absolute right-4 top-4 flex space-x-2"
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 200,
            mass: 0.5,
          }}
        >
          {audioFeedback && (
            <motion.button
              layout
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleMute()}
              className={cn(
                "rounded-full p-1.5 opacity-70 transition-opacity",
                "hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background"
              )}
              style={{
                color: theme.textColor,
              }}
              aria-label={isMuted ? "Unmute" : "Mute"}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.5,
              }}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </motion.button>
          )}

          <motion.button
            layout
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMaximize}
            className={cn(
              "rounded-full p-1.5 opacity-70 transition-opacity",
              "hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background"
            )}
            style={{
              color: theme.textColor,
            }}
            aria-label={isMaximized ? "Minimize" : "Maximize"}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              mass: 0.5,
            }}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </motion.button>

          {/* Close Button */}
          {showCloseButton && (
            <motion.button
              layout
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className={cn(
                "rounded-full p-1.5 opacity-70 transition-opacity",
                "hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background"
              )}
              style={{
                color: theme.textColor,
              }}
              aria-label="Close"
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
                mass: 0.5,
              }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    );
  }
);

const DialogTrigger = React.forwardRef<HTMLElement, DialogTriggerProps>(
  ({ children, asChild = false, className, onClick, ...props }, ref) => {
    const { theme } = useTheme();
    const { onOpenChange } = useDialogContext();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      onOpenChange(true);
      onClick?.(e);
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: ref,
        onClick: handleClick,
        ...props,
      });
    }

    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "px-4 py-2",
          className
        )}
        style={{
          color: theme.textColor,
          backgroundColor: isPressed
            ? `${theme.primaryColor}20`
            : isHovered
            ? `${theme.primaryColor}10`
            : "transparent",
          border: `1px solid ${theme.secondaryColor}40`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

// New component to handle body wrapper with scrolling
const DialogBodyWrapper = ({
  children,
  isMaximized,
  scrollable,
  scrollVariant,
  scrollDirection,
  maxHeight,
  maxWidth,
  scale,
}: {
  children: React.ReactNode;
  isMaximized: boolean;
  scrollable: boolean;
  scrollVariant: ScrollVariantType;
  scrollDirection: ScrollDirectionType;
  maxHeight?: string | number;
  maxWidth?: string | number;
  scale: SpaceVariantType;
}) => {
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
    if (!scrollable) return { flex: 1 };

    const styles: React.CSSProperties = { flex: 1 };

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
        if (!maxHeight && !isMaximized) styles.maxHeight = "60vh";
        break;
      case "horizontal":
        styles.overflowX = "auto";
        styles.overflowY = "hidden";
        styles.whiteSpace = "nowrap";
        break;
      case "both":
        styles.overflow = "auto";
        if (!maxHeight && !isMaximized) styles.maxHeight = "60vh";
        break;
      case "none":
      default:
        break;
    }

    return styles;
  };

  return (
    <motion.div
      layout
      className={cn("flex-1", scrollable && getScrollbarClasses())}
      style={getScrollableStyles()}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 200,
        mass: 0.5,
      }}
    >
      {children}
    </motion.div>
  );
};

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  (
    {
      children,
      className,
      showBorder = true,
      scale = "lg",
      isMaximized,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0 0 0.75rem 0";
        case "lg":
          return "0 0 1rem 0";
        case "xl":
          return "0 0 1.25rem 0";
        default:
          return "0 0 1rem 0";
      }
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className={cn(
          "transition-all duration-200 flex-shrink-0",
          isMaximized && "px-4",
          className
        )}
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

const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, className, scale = "lg", isMaximized, ...props }, ref) => {
    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0.75rem 0";
        case "lg":
          return "1rem 0";
        case "xl":
          return "1.25rem 0";
        default:
          return "1rem 0";
      }
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className={cn(
          "transition-all duration-200",
          isMaximized && "px-4",
          className
        )}
        style={{
          padding: getPadding(),
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  (
    {
      children,
      className,
      showBorder = true,
      scale = "lg",
      sticky = false,
      isMaximized,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const getPadding = () => {
      switch (scale) {
        case "sm":
          return "0.75rem 0 0 0";
        case "lg":
          return "1rem 0 0 0";
        case "xl":
          return "1.25rem 0 0 0";
        default:
          return "1rem 0 0 0";
      }
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        className={cn(
          "transition-all duration-200 flex-shrink-0",
          sticky && "sticky bottom-0 backdrop-blur-sm",
          isMaximized && "px-4",
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
      </motion.div>
    );
  }
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, gradient = false, scale = "lg", ...props }, ref) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    const getFontSize = () => {
      switch (scale) {
        case "sm":
          return "1.125rem";
        case "lg":
          return "1.5rem";
        case "xl":
          return "1.875rem";
        default:
          return "1.5rem";
      }
    };

    const gradientStyle = gradient
      ? {
          background:
            theme.primaryGradient ||
            `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }
      : {};

    return (
      <motion.h2
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
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
      </motion.h2>
    );
  }
);

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ children, className, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();

  const getFontSize = () => {
    switch (scale) {
      case "sm":
        return "0.875rem";
      case "lg":
        return "1rem";
      case "xl":
        return "1.125rem";
      default:
        return "1rem";
    }
  };

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className={cn("transition-all duration-200 mt-2", className)}
      style={{
        fontSize: getFontSize(),
        color: theme.textDimmed,
        lineHeight: "1.5",
      }}
      {...props}
    >
      {children}
    </motion.p>
  );
});

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open: controlledOpen,
      onOpenChange: controlledOnOpenChange,
      children,
      variant = "default",
      scale = "lg",
      closeOnOutsideClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      animateOnMount = true,
      resizable = false,
      onMaximizeChange,
      audioFeedback = false,
      scrollable = false,
      scrollVariant = "default",
      scrollDirection = "vertical",
      maxHeight,
      maxWidth,
      defaultOpen = false,
    },
    ref
  ) => {
    // Internal state for uncontrolled usage
    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    // Determine if component is controlled or uncontrolled
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const onOpenChange = isControlled
      ? controlledOnOpenChange!
      : setInternalOpen;

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === "Escape" && open) {
          onOpenChange(false);
        }
      };

      if (open) {
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }, [open, closeOnEscape, onOpenChange]);

    const handleClose = () => {
      onOpenChange(false);
    };

    // Split children into trigger and content
    const childrenArray = React.Children.toArray(children);
    let triggerContent: React.ReactNode = null;
    const dialogContent: React.ReactNode[] = [];

    childrenArray.forEach((child) => {
      if (React.isValidElement(child)) {
        if (child.type === DialogTrigger) {
          triggerContent = child;
        } else {
          dialogContent.push(child);
        }
      } else {
        dialogContent.push(child);
      }
    });

    return (
      <DialogContext.Provider value={{ open, onOpenChange }}>
        {/* Render trigger outside of portal */}
        {triggerContent}

        {/* Render dialog content in portal */}
        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence mode="wait">
              {open && (
                <DialogOverlay
                  ref={ref}
                  variant={variant}
                  closeOnOutsideClick={closeOnOutsideClick}
                  onClose={handleClose}
                  blurStrength="medium"
                >
                  <DialogContent
                    variant={variant}
                    scale={scale}
                    showCloseButton={showCloseButton}
                    animateOnMount={animateOnMount}
                    resizable={resizable}
                    onMaximizeChange={onMaximizeChange}
                    audioFeedback={audioFeedback}
                    scrollable={scrollable}
                    scrollVariant={scrollVariant}
                    scrollDirection={scrollDirection}
                    maxHeight={maxHeight}
                    maxWidth={maxWidth}
                  >
                    {dialogContent}
                  </DialogContent>
                </DialogOverlay>
              )}
            </AnimatePresence>,
            document.body
          )}
      </DialogContext.Provider>
    );
  }
);

Dialog.displayName = "Dialog";
DialogOverlay.displayName = "DialogOverlay";
DialogContent.displayName = "DialogContent";
DialogHeader.displayName = "DialogHeader";
DialogBody.displayName = "DialogBody";
DialogFooter.displayName = "DialogFooter";
DialogTitle.displayName = "DialogTitle";
DialogDescription.displayName = "DialogDescription";
DialogTrigger.displayName = "DialogTrigger";

export {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
};
