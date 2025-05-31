import React, { useRef, useState } from "react";
import {
  motion,
  type HTMLMotionProps,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";
import { IconLayoutNavbarCollapse, IconX } from "@tabler/icons-react";

export interface DocksItems {
  id: number;
  title: string;
  icon: React.ReactNode;
  href: string;
  tab: string;
}

type FloatingDockProps = {
  items: DocksItems[];
  desktopClassName?: string;
  mobileClassName?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  disabled?: boolean;
};

const FloatingDock = React.forwardRef<HTMLDivElement, FloatingDockProps>(
  (
    {
      items,
      desktopClassName,
      mobileClassName,
      activeTab,
      setActiveTab,
      variant = "default",
      scale = "lg",
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <>
        <FloatingDockDesktop
          ref={ref}
          items={items}
          className={desktopClassName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          variant={variant}
          scale={scale}
          disabled={disabled}
          {...props}
        />
        <FloatingDockMobile
          items={items}
          className={mobileClassName}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          variant={variant}
          scale={scale}
          disabled={disabled}
        />
      </>
    );
  }
);

const FloatingDockMobile = ({
  items,
  className,
  activeTab,
  setActiveTab,
  variant = "default",
  scale = "lg",
  disabled = false,
}: {
  items: DocksItems[];
  className?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  colorVariant?:
    | "default"
    | "error"
    | "success"
    | "accent"
    | "warning"
    | "info"
    | "secondary";
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return {
          buttonSize: "w-10 h-10",
          iconSize: "h-4 w-4",
          itemSize: "w-8 h-8",
          itemIconSize: "w-4 h-4",
          textSize: "text-xs",
          padding: "p-3",
          gap: "gap-2",
        };
      case "lg":
        return {
          buttonSize: "w-14 h-14",
          iconSize: "h-6 w-6",
          itemSize: "w-12 h-12",
          itemIconSize: "w-6 h-6",
          textSize: "text-sm",
          padding: "p-6",
          gap: "gap-4",
        };
      case "xl":
        return {
          buttonSize: "w-16 h-16",
          iconSize: "h-7 w-7",
          itemSize: "w-14 h-14",
          itemIconSize: "w-7 h-7",
          textSize: "text-base",
          padding: "p-8",
          gap: "gap-5",
        };
      default:
        return {
          buttonSize: "w-14 h-14",
          iconSize: "h-6 w-6",
          itemSize: "w-12 h-12",
          itemIconSize: "w-6 h-6",
          textSize: "text-sm",
          padding: "p-6",
          gap: "gap-4",
        };
    }
  };

  const scaleStyles = getScaleStyles();

  const getVariantStyles = () => {
    const baseStyle = {
      background: theme.backgroundColor,
      color: theme.textColor,
      border: `1px solid ${theme.primaryShade}`,
    };

    switch (variant) {
      case "minimal":
        return {
          background: "transparent",
          color: theme.textColor,
          border: `1px solid ${theme.textDimmed}30`,
          backdropFilter: "blur(8px)",
        };
      default:
        return baseStyle;
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className={cn("relative block md:hidden z-50", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 flex items-end justify-center pb-24"
            style={{ backgroundColor: `${theme.backgroundColor}90` }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "relative w-5/6 max-w-sm rounded-2xl overflow-hidden",
                scaleStyles.padding
              )}
              style={variantStyles}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="absolute right-4 top-4 rounded-full p-1"
                onClick={() => setOpen(false)}
                style={{ color: theme.textDimmed }}
                disabled={disabled}
              >
                <IconX className="w-5 h-5" />
              </motion.button>

              <div className="mb-6 text-center">
                <h3
                  className={cn("font-medium", scaleStyles.textSize)}
                  style={{ color: theme.textColor }}
                >
                  Menu
                </h3>
                <p className="text-xs mt-1" style={{ color: theme.textDimmed }}>
                  Select a destination
                </p>
              </div>

              <div className={cn("grid grid-cols-3", scaleStyles.gap)}>
                {items.map((item, idx) => {
                  const isActive = item.tab === activeTab;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: idx * 0.05 },
                      }}
                      exit={{
                        opacity: 0,
                        y: 10,
                        transition: { delay: (items.length - 1 - idx) * 0.03 },
                      }}
                      className="flex flex-col items-center"
                    >
                      <motion.a
                        href={item.href}
                        whileHover={!disabled ? { scale: 1.05 } : {}}
                        whileTap={!disabled ? { scale: 0.95 } : {}}
                        onClick={(e) => {
                          e.preventDefault();
                          if (!disabled) {
                            setActiveTab(item.tab);
                            setTimeout(() => setOpen(false), 300);
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center",
                          scaleStyles.padding,
                          disabled && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <motion.div
                          className={cn(
                            "relative flex items-center justify-center rounded-2xl mb-2",
                            scaleStyles.itemSize
                          )}
                          style={{
                            background: isActive
                              ? `${theme.primaryColor}20`
                              : variant === "minimal"
                              ? "transparent"
                              : `${theme.backgroundColor}50`,
                            border:
                              variant === "minimal"
                                ? `1px solid ${
                                    isActive
                                      ? theme.primaryColor
                                      : theme.textDimmed
                                  }30`
                                : "none",
                            boxShadow: isActive
                              ? `0 10px 20px ${theme.primaryColor}20`
                              : variant === "default"
                              ? `0 8px 16px ${theme.backgroundColor}20`
                              : "none",
                          }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-pill-mobile"
                              className="absolute inset-0 rounded-2xl"
                              style={{
                                borderWidth: "2px",
                                borderStyle: "solid",
                                borderColor: theme.primaryColor,
                                boxShadow: `0 0 10px ${theme.primaryColor}50`,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}

                          <motion.div
                            animate={{
                              scale: isActive ? 1.1 : 1,
                              color: isActive
                                ? theme.primaryColor
                                : theme.textColor,
                            }}
                            className={cn(
                              "relative z-10",
                              scaleStyles.itemIconSize
                            )}
                          >
                            {item.icon}
                          </motion.div>
                        </motion.div>

                        <motion.span
                          animate={{
                            color: isActive
                              ? theme.primaryColor
                              : theme.textColor,
                            fontWeight: isActive ? 600 : 400,
                          }}
                          className="text-xs text-center"
                        >
                          {item.title}
                        </motion.span>
                      </motion.a>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 rounded-full flex items-center justify-center z-50",
          scaleStyles.buttonSize,
          disabled && "cursor-not-allowed opacity-50"
        )}
        style={{
          background:
            variant === "minimal" ? "transparent" : theme.primaryColor,
          border:
            variant === "minimal"
              ? `1px solid ${theme.primaryColor}50`
              : "none",
          backdropFilter: variant === "minimal" ? "blur(8px)" : "none",
          boxShadow:
            variant === "default"
              ? `0 6px 20px ${theme.backgroundColor}30`
              : `0 4px 15px ${theme.primaryColor}20`,
        }}
        disabled={disabled}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                color:
                  variant === "minimal"
                    ? theme.primaryColor
                    : theme.backgroundColor,
              }}
            >
              <IconX className={scaleStyles.iconSize} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                color:
                  variant === "minimal"
                    ? theme.primaryColor
                    : theme.backgroundColor,
              }}
            >
              <IconLayoutNavbarCollapse className={scaleStyles.iconSize} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

const FloatingDockDesktop = React.forwardRef<
  HTMLDivElement,
  {
    items: DocksItems[];
    className?: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    variant?: DesignVariantType;
    scale?: SpaceVariantType;
    colorVariant?:
      | "default"
      | "error"
      | "success"
      | "accent"
      | "warning"
      | "info"
      | "secondary";
    disabled?: boolean;
  } & HTMLMotionProps<"div">
>(
  (
    {
      items,
      className,
      activeTab,
      setActiveTab,
      variant = "default",
      scale = "lg",
      colorVariant = "default",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const mouseX = useMotionValue(Infinity);
    const { theme } = useTheme();

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return {
            height: "h-10",
            padding: "px-3 pb-2",
            gap: "gap-2",
            borderRadius: "rounded-xl",
          };
        case "lg":
          return {
            height: "h-16",
            padding: "px-6 pb-3",
            gap: "gap-4",
            borderRadius: "rounded-2xl",
          };
        case "xl":
          return {
            height: "h-20",
            padding: "px-8 pb-4",
            gap: "gap-6",
            borderRadius: "rounded-3xl",
          };
        default:
          return {
            height: "h-16",
            padding: "px-6 pb-3",
            gap: "gap-4",
            borderRadius: "rounded-2xl",
          };
      }
    };

    const scaleStyles = getScaleStyles();

    const getVariantStyles = () => {
      const baseStyle = {
        background: `linear-gradient(to bottom, ${theme.backgroundColor}10, ${theme.backgroundColor}90)`,
        backdropFilter: "blur(12px)",
        borderTop: `1px solid ${theme.primaryColor}15`,
        boxShadow: `0 -5px 20px ${theme.backgroundColor}20, 0 -1px 8px ${theme.backgroundColor}10`,
      };

      switch (variant) {
        case "minimal":
          return {
            background: "transparent",
            backdropFilter: "blur(8px)",
            borderTop: `1px solid ${theme.textDimmed}20`,
            border: `1px solid ${theme.textDimmed}30`,
            boxShadow: `0 -2px 10px ${theme.backgroundColor}10`,
          };
        default:
          return baseStyle;
      }
    };

    const variantStyles = getVariantStyles();

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => !disabled && mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        style={variantStyles}
        className={cn(
          "fixed bottom-6 left-0 right-0 w-fit justify-center mx-auto items-end hidden md:flex",
          scaleStyles.height,
          scaleStyles.padding,
          scaleStyles.gap,
          scaleStyles.borderRadius,
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        {...props}
      >
        {items.map((item, index) => (
          <IconContainer
            key={item.id}
            mouseX={mouseX}
            item={item}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            variant={variant}
            scale={scale}
            colorVariant={colorVariant}
            disabled={disabled}
            isFirst={index === 0}
            isLast={index === items.length - 1}
          />
        ))}
      </motion.div>
    );
  }
);

function IconContainer({
  mouseX,
  item,
  activeTab,
  setActiveTab,
  variant = "default",
  scale = "lg",
  disabled = false,
  isFirst,
  isLast,
}: {
  mouseX: MotionValue;
  item: DocksItems;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  colorVariant?:
    | "default"
    | "error"
    | "success"
    | "accent"
    | "warning"
    | "info"
    | "secondary";
  disabled?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const { title, icon, href, tab } = item;
  const { theme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [animateActive, setAnimateActive] = useState(false);

  const isActive = tab === activeTab;

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const getScaleSizes = () => {
    switch (scale) {
      case "sm":
        return {
          base: [28, 52, 28],
          icon: [14, 26, 14],
        };
      case "lg":
        return {
          base: [40, 80, 40],
          icon: [20, 40, 20],
        };
      case "xl":
        return {
          base: [48, 96, 48],
          icon: [24, 48, 24],
        };
      default:
        return {
          base: [40, 80, 40],
          icon: [20, 40, 20],
        };
    }
  };

  const scaleSizes = getScaleSizes();

  const widthTransform = useTransform(
    distance,
    [-150, 0, 150],
    scaleSizes.base
  );
  const heightTransform = useTransform(
    distance,
    [-150, 0, 150],
    scaleSizes.base
  );
  const widthTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    scaleSizes.icon
  );
  const heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    scaleSizes.icon
  );

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const handleClick = () => {
    if (disabled) return;
    setAnimateActive(true);
    setActiveTab(tab);
    setTimeout(() => setAnimateActive(false), 500);
  };

  const getActiveStyles = () => {
    const baseStyles = {
      background: theme.backgroundColor,
      boxShadow: `0 3px 10px ${theme.backgroundColor}20, 0 0 0 1px ${theme.backgroundColor}25`,
    };

    switch (variant) {
      case "minimal":
        if (isActive) {
          return {
            background: "transparent",
            border: `2px solid ${theme.primaryColor}`,
            boxShadow: `0 0 0 4px ${theme.primaryColor}20`,
          };
        } else if (hovered) {
          return {
            background: "transparent",
            border: `1px solid ${theme.primaryColor}50`,
            boxShadow: `0 5px 15px ${theme.backgroundColor}20`,
          };
        } else {
          return {
            background: "transparent",
            border: `1px solid ${theme.textDimmed}30`,
            boxShadow: "none",
          };
        }
      default:
        if (isActive) {
          return {
            ...baseStyles,
            boxShadow: `0 0 0 2px ${theme.backgroundColor}, 0 0 0 4px ${theme.primaryColor}30`,
          };
        } else if (hovered) {
          return {
            ...baseStyles,
            boxShadow: `0 5px 15px ${theme.backgroundColor}30, 0 2px 5px ${theme.backgroundColor}20`,
          };
        } else {
          return baseStyles;
        }
    }
  };

  const activeStyles = getActiveStyles();

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.4,
        delay: isFirst ? 0.1 : isLast ? 0.3 : 0.2,
        type: "spring",
      }}
    >
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
        className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
      >
        <motion.div
          ref={ref}
          style={{
            width,
            height,
            ...activeStyles,
          }}
          animate={{
            scale: animateActive ? 1.15 : isActive ? 1.05 : 1,
            opacity: disabled ? 0.5 : 1,
          }}
          transition={{
            duration: 0.5,
            type: "spring",
            bounce: 0.25,
          }}
          onMouseEnter={() => !disabled && setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex aspect-square items-center justify-center rounded-full relative"
        >
          <AnimatePresence>
            {(hovered || isActive) && !disabled && (
              <motion.div
                key="glow"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle at center, ${
                    isActive
                      ? `${theme.primaryColor}40`
                      : `${theme.backgroundColor}30`
                  }, transparent 70%)`,
                  filter: "blur(5px)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
            {hovered && !disabled && (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, y: 10, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: 2, x: "-50%" }}
                className="absolute -top-8 left-1/2 w-fit rounded-md px-2 py-0.5 text-xs whitespace-pre shadow-sm"
                style={{
                  transform: "translateX(-50%)",
                  background:
                    variant === "minimal"
                      ? "transparent"
                      : theme.backgroundColor,
                  color: theme.textColor,
                  border: `1px solid ${
                    variant === "minimal"
                      ? theme.textDimmed
                      : theme.primaryShade
                  }`,
                  backdropFilter: variant === "minimal" ? "blur(8px)" : "none",
                }}
              >
                {title}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            style={{ width: widthIcon, height: heightIcon }}
            className="flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                color: isActive
                  ? variant === "minimal"
                    ? theme.primaryColor
                    : theme.textColor
                  : theme.textColor,
              }}
            >
              {icon}
            </motion.div>
          </motion.div>
        </motion.div>
      </a>
    </motion.div>
  );
}

FloatingDock.displayName = "FloatingDock";

export { FloatingDock };
