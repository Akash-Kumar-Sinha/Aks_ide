import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type AccordionProps = {
  children: React.ReactNode;
  className?: string;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  collapsible?: boolean;
  type?: "single" | "multiple";
};

type AccordionItemProps = {
  children: React.ReactNode;
  className?: string;
  value: string;
  disabled?: boolean;
};

type AccordionTriggerProps = {
  children: React.ReactNode;
  className?: string;
  Icon?: React.ElementType;
  iconPosition?: "left" | "right";
};

type AccordionContentProps = {
  children: React.ReactNode;
  className?: string;
};

const AccordionContext = React.createContext<{
  variant: DesignVariantType;
  scale: SpaceVariantType;
  openItems: string[];
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
}>({
  variant: "default",
  scale: "lg",
  openItems: [],
  toggleItem: () => {},
  type: "single",
});

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      children,
      className,
      variant = "default",
      scale = "lg",
      collapsible = true,
      type = "single",
      ...props
    },
    ref
  ) => {
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          if (prev.includes(value)) {
            return collapsible ? [] : [value];
          }
          return [value];
        } else {
          return prev.includes(value)
            ? prev.filter((item) => item !== value)
            : [...prev, value];
        }
      });
    };

    return (
      <AccordionContext.Provider
        value={{ variant, scale, openItems, toggleItem, type }}
      >
        <motion.div
          ref={ref}
          className={cn("space-y-2", className)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          {...props}
        >
          {children}
        </motion.div>
      </AccordionContext.Provider>
    );
  }
);

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ children, className, value, disabled = false, ...props }, ref) => {
    const { variant, scale, openItems } = React.useContext(AccordionContext);
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const isOpen = openItems.includes(value);

    const getSpacingByScale = () => {
      switch (scale) {
        case "sm":
          return {
            borderRadius: "rounded-md",
            spacing: "space-y-1",
          };
        case "lg":
          return {
            borderRadius: "rounded-lg",
            spacing: "space-y-2",
          };
        case "xl":
          return {
            borderRadius: "rounded-xl",
            spacing: "space-y-3",
          };
        default:
          return {
            borderRadius: "rounded-lg",
            spacing: "space-y-2",
          };
      }
    };

    const { borderRadius } = getSpacingByScale();

    const getItemStyles = () => {
      const baseStyles = {
        transition: "all 0.2s ease",
      };

      switch (variant) {
        case "default":
          return {
            ...baseStyles,
            backgroundColor: disabled
              ? `${theme.secondaryColor}20`
              : theme.backgroundColor,
            border: `1px solid ${theme.secondaryColor}${
              disabled ? "20" : isOpen ? "60" : "40"
            }`,
            boxShadow: disabled
              ? "none"
              : `0 1px 2px ${theme.secondaryShade}40`,
          };
        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            border: "none",
            borderBottom: `1px solid ${theme.secondaryColor}40`,
          };
        default:
          return baseStyles;
      }
    };

    return (
      <AccordionItemContext.Provider value={{ value, disabled, isOpen }}>
        <motion.div
          ref={ref}
          className={cn(borderRadius, "overflow-hidden", className)}
          style={getItemStyles()}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={!disabled && variant === "default" ? { scale: 1.01 } : {}}
          {...props}
        >
          {/* Hover background for default variant */}
          {variant === "default" && (
            <AnimatePresence>
              {isHovered && !disabled && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: `${theme.primaryColor}10`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>
          )}
          {children}
        </motion.div>
      </AccordionItemContext.Provider>
    );
  }
);

const AccordionItemContext = React.createContext<{
  value: string;
  disabled: boolean;
  isOpen: boolean;
}>({
  value: "",
  disabled: false,
  isOpen: false,
});

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ children, className, Icon, iconPosition = "left", ...props }, ref) => {
  const { variant, scale, toggleItem } = React.useContext(AccordionContext);
  const { value, disabled, isOpen } = React.useContext(AccordionItemContext);
  const { theme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      toggleItem(value);
    }
  };

  const getSpacingByScale = () => {
    switch (scale) {
      case "sm":
        return {
          padding: "px-3 py-1.5",
          gap: "gap-1.5",
          fontSize: "text-xs",
          iconSize: 12,
        };
      case "lg":
        return {
          padding: "px-4 py-3",
          gap: "gap-2",
          fontSize: "text-sm",
          iconSize: 16,
        };
      case "xl":
        return {
          padding: "px-5 py-4",
          gap: "gap-3",
          fontSize: "text-base",
          iconSize: 20,
        };
      default:
        return {
          padding: "px-4 py-3",
          gap: "gap-2",
          fontSize: "text-sm",
          iconSize: 16,
        };
    }
  };

  const { padding, gap, fontSize, iconSize } = getSpacingByScale();

  return (
    <motion.button
      ref={ref}
      onClick={handleClick}
      onTap={() => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
      }}
      className={cn(
        "relative z-10 flex items-center justify-between w-full font-medium transition-all duration-200 outline-none",
        padding,
        fontSize,
        disabled && "cursor-not-allowed",
        variant === "minimal" && "border-none bg-transparent",
        className
      )}
      style={{
        color: disabled
          ? `${theme.textColor}60`
          : isOpen
          ? theme.primaryColor
          : theme.textColor,
      }}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      {...props}
    >
      <div className={cn("flex items-center", gap)}>
        {Icon && iconPosition === "left" && (
          <motion.div
            initial={{ opacity: 0, x: -2 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={iconSize} strokeWidth={1.5} />
          </motion.div>
        )}
        <span>{children}</span>
        {Icon && iconPosition === "right" && (
          <motion.div
            initial={{ opacity: 0, x: 2 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={iconSize} strokeWidth={1.5} />
          </motion.div>
        )}
      </div>

      <motion.div
        animate={{
          rotate: isOpen ? 180 : 0,
          scale: isPressed ? 0.9 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
      >
        <ChevronDown
          size={iconSize}
          style={{
            color: disabled
              ? `${theme.textColor}40`
              : isOpen
              ? theme.primaryColor
              : theme.secondaryColor,
          }}
        />
      </motion.div>
    </motion.button>
  );
});

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ children, className, ...props }, ref) => {
  const { variant, scale } = React.useContext(AccordionContext);
  const { isOpen } = React.useContext(AccordionItemContext);
  const { theme } = useTheme();

  const getSpacingByScale = () => {
    switch (scale) {
      case "sm":
        return {
          padding: "px-3 pb-1.5",
          fontSize: "text-xs",
        };
      case "lg":
        return {
          padding: "px-4 pb-3",
          fontSize: "text-sm",
        };
      case "xl":
        return {
          padding: "px-5 pb-4",
          fontSize: "text-base",
        };
      default:
        return {
          padding: "px-4 pb-3",
          fontSize: "text-sm",
        };
    }
  };

  const { padding, fontSize } = getSpacingByScale();

  const getContentStyles = () => {
    switch (variant) {
      case "default":
        return {
          backgroundColor: `${theme.backgroundColor}60`,
          borderTop: `1px solid ${theme.secondaryColor}20`,
        };
      case "minimal":
        return {
          backgroundColor: "transparent",
        };
      default:
        return {};
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          className={cn("overflow-hidden", fontSize, className)}
          style={{
            color: theme.textDimmed || theme.textColor,
            ...getContentStyles(),
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.3, ease: [0.25, 1, 0.5, 1] },
            opacity: { duration: 0.2, ease: "easeOut" },
          }}
          {...props}
        >
          <motion.div
            className={cn(padding)}
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            exit={{ y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Accordion.displayName = "Accordion";
AccordionItem.displayName = "AccordionItem";
AccordionTrigger.displayName = "AccordionTrigger";
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
