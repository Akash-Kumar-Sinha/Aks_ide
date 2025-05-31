import React, { useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle, Search, Pin, PinOff } from "lucide-react";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { cn } from "../lib/utils";
import useTheme from "../lib/useTheme";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

// Base DropdownMenu
const DropdownMenu = DropdownMenuPrimitive.Root;

// Trigger Component
type DropdownMenuTriggerProps = HTMLMotionProps<"button"> & {
  children: React.ReactNode;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  disabled?: boolean;
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(
  (
    {
      children,
      className,
      variant = "default",
      scale = "lg",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Render based on design variant
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <DropdownMenuPrimitive.Trigger asChild>
                <motion.button
                  ref={ref}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border outline-none",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                  )}
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                    borderColor: theme.secondaryShade,
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                  disabled={disabled}
                  {...props}
                >
                  {children}
                </motion.button>
              </DropdownMenuPrimitive.Trigger>
            );

          case "lg":
            return (
              <DropdownMenuPrimitive.Trigger asChild>
                <motion.button
                  ref={ref}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border outline-none",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                  )}
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                    borderColor: theme.secondaryShade,
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                  disabled={disabled}
                  {...props}
                >
                  {children}
                </motion.button>
              </DropdownMenuPrimitive.Trigger>
            );

          case "xl":
            return (
              <DropdownMenuPrimitive.Trigger asChild>
                <motion.button
                  ref={ref}
                  className={cn(
                    "inline-flex items-center gap-3 px-6 py-3 text-base font-medium rounded-lg border outline-none",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                  )}
                  style={{
                    backgroundColor: theme.backgroundColor,
                    color: theme.textColor,
                    borderColor: theme.secondaryShade,
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={!disabled ? { scale: 1.02 } : {}}
                  whileTap={!disabled ? { scale: 0.98 } : {}}
                  disabled={disabled}
                  {...props}
                >
                  {children}
                </motion.button>
              </DropdownMenuPrimitive.Trigger>
            );

          default:
            return null;
        }

      case "minimal":
        switch (scale) {
          case "sm":
            return (
              <DropdownMenuPrimitive.Trigger asChild>
                <motion.button
                  ref={ref}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 text-xs font-normal rounded-md border-b border-transparent outline-none transition-all duration-200",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                  )}
                  style={{
                    backgroundColor: "transparent",
                    color: theme.textColor,
                    borderBottomColor: "transparent",
                  }}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={
                    !disabled
                      ? {
                          y: -1,
                          borderBottomColor: `${theme.primaryColor}40`,
                        }
                      : {}
                  }
                  disabled={disabled}
                  {...props}
                >
                  {children}
                </motion.button>
              </DropdownMenuPrimitive.Trigger>
            );

          case "lg":
            return (
              <DropdownMenuPrimitive.Trigger asChild>
                <motion.button
                  ref={ref}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2 text-sm font-normal rounded-md border-b border-transparent outline-none transition-all duration-200",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                  )}
                  style={{
                    backgroundColor: "transparent",
                    color: theme.textColor,
                    borderBottomColor: "transparent",
                  }}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={
                    !disabled
                      ? {
                          y: -2,
                          borderBottomColor: `${theme.primaryColor}40`,
                        }
                      : {}
                  }
                  disabled={disabled}
                  {...props}
                >
                  {children}
                </motion.button>
              </DropdownMenuPrimitive.Trigger>
            );

          case "xl":
            return (
              <DropdownMenuPrimitive.Trigger asChild>
                <motion.button
                  ref={ref}
                  className={cn(
                    "inline-flex items-center gap-3 px-4 py-3 text-base font-normal rounded-lg border-b-2 border-transparent outline-none transition-all duration-200",
                    disabled && "cursor-not-allowed opacity-50",
                    className
                  )}
                  style={{
                    backgroundColor: "transparent",
                    color: theme.textColor,
                    borderBottomColor: "transparent",
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  whileHover={
                    !disabled
                      ? {
                          y: -3,
                          borderBottomColor: `${theme.primaryColor}40`,
                        }
                      : {}
                  }
                  disabled={disabled}
                  {...props}
                >
                  {children}
                </motion.button>
              </DropdownMenuPrimitive.Trigger>
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }
);

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

// Content Component
type DropdownMenuContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> & {
  scale?: SpaceVariantType;
};

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "min-w-[6rem] p-1";
      case "lg":
        return "min-w-[8rem] p-1";
      case "xl":
        return "min-w-[12rem] p-2";
      default:
        return "min-w-[8rem] p-1";
    }
  };

  return (
    <DropdownMenuPrimitive.Portal>
      <AnimatePresence>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          asChild
          {...props}
        >
          <motion.div
            className={cn(
              "z-50 overflow-hidden rounded-md border shadow-lg",
              getScaleStyles(),
              className
            )}
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.secondaryShade,
              color: theme.textColor,
            }}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {props.children}
          </motion.div>
        </DropdownMenuPrimitive.Content>
      </AnimatePresence>
    </DropdownMenuPrimitive.Portal>
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

// Item Component
type DropdownMenuItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> & {
  scale?: SpaceVariantType;
  icon?: React.ReactNode;
};

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, scale = "lg", icon, ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-1 text-xs gap-1";
      case "lg":
        return "px-2 py-1.5 text-sm gap-2";
      case "xl":
        return "px-3 py-2 text-base gap-3";
      default:
        return "px-2 py-1.5 text-sm gap-2";
    }
  };

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors duration-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        getScaleStyles(),
        className
      )}
      style={{
        color: theme.textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${theme.primaryShade}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {props.children}
    </DropdownMenuPrimitive.Item>
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

// Label Component
type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
> & {
  scale?: SpaceVariantType;
};

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-2 py-1.5 text-sm";
      case "xl":
        return "px-3 py-2 text-base";
      default:
        return "px-2 py-1.5 text-sm";
    }
  };

  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn("font-semibold", getScaleStyles(), className)}
      style={{
        color: theme.primaryColor,
      }}
      {...props}
    />
  );
});

DropdownMenuLabel.displayName = "DropdownMenuLabel";

// Separator Component
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const { theme } = useTheme();

  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px", className)}
      style={{
        backgroundColor: theme.secondaryShade,
      }}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

// Checkbox Item Component
type DropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.CheckboxItem
> & {
  scale?: SpaceVariantType;
};

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, checked, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "py-1 pl-6 pr-2 text-xs";
      case "lg":
        return "py-1.5 pl-8 pr-2 text-sm";
      case "xl":
        return "py-2 pl-10 pr-3 text-base";
      default:
        return "py-1.5 pl-8 pr-2 text-sm";
    }
  };

  const getIconSize = () => {
    switch (scale) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-3.5 w-3.5";
      case "xl":
        return "h-4 w-4";
      default:
        return "h-3.5 w-3.5";
    }
  };

  const getIconPosition = () => {
    switch (scale) {
      case "sm":
        return "left-1.5";
      case "lg":
        return "left-2";
      case "xl":
        return "left-3";
      default:
        return "left-2";
    }
  };

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        getScaleStyles(),
        className
      )}
      style={{
        color: theme.textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${theme.primaryShade}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      checked={checked}
      {...props}
    >
      <span
        className={cn(
          "absolute flex items-center justify-center rounded-sm border",
          getIconSize(),
          getIconPosition()
        )}
        style={{
          borderColor: checked ? theme.primaryColor : theme.secondaryColor,
          backgroundColor: checked ? theme.primaryColor : "transparent",
        }}
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <Check
            className={getIconSize()}
            style={{ color: theme.backgroundColor }}
          />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

// Radio Item Component
type DropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioItem
> & {
  scale?: SpaceVariantType;
};

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "py-1 pl-6 pr-2 text-xs";
      case "lg":
        return "py-1.5 pl-8 pr-2 text-sm";
      case "xl":
        return "py-2 pl-10 pr-3 text-base";
      default:
        return "py-1.5 pl-8 pr-2 text-sm";
    }
  };

  const getIconSize = () => {
    switch (scale) {
      case "sm":
        return "h-3 w-3";
      case "lg":
        return "h-3.5 w-3.5";
      case "xl":
        return "h-4 w-4";
      default:
        return "h-3.5 w-3.5";
    }
  };

  const getIconPosition = () => {
    switch (scale) {
      case "sm":
        return "left-1.5";
      case "lg":
        return "left-2";
      case "xl":
        return "left-3";
      default:
        return "left-2";
    }
  };

  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        getScaleStyles(),
        className
      )}
      style={{
        color: theme.textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${theme.primaryShade}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      {...props}
    >
      <span
        className={cn(
          "absolute flex items-center justify-center rounded-full border",
          getIconSize(),
          getIconPosition()
        )}
        style={{
          borderColor: theme.secondaryColor,
        }}
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2" style={{ fill: theme.primaryColor }} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

// Sub Components
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

// Sub Trigger Component
type DropdownMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubTrigger
> & {
  scale?: SpaceVariantType;
  icon?: React.ReactNode;
};

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, scale = "lg", icon, ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-1 text-xs gap-1";
      case "lg":
        return "px-2 py-1.5 text-sm gap-2";
      case "xl":
        return "px-3 py-2 text-base gap-3";
      default:
        return "px-2 py-1.5 text-sm gap-2";
    }
  };

  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm outline-none transition-colors data-[state=open]:bg-accent",
        getScaleStyles(),
        className
      )}
      style={{
        color: theme.textColor,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${theme.primaryShade}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {props.children}
      <ChevronRight
        className="ml-auto h-4 w-4"
        style={{ color: theme.secondaryColor }}
      />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

// Sub Content Component
type DropdownMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubContent
> & {
  scale?: SpaceVariantType;
};

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(({ className, scale = "lg", ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "min-w-[6rem] p-1";
      case "lg":
        return "min-w-[8rem] p-1";
      case "xl":
        return "min-w-[12rem] p-2";
      default:
        return "min-w-[8rem] p-1";
    }
  };

  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 overflow-hidden rounded-md border shadow-lg",
        getScaleStyles(),
        className
      )}
      style={{
        backgroundColor: theme.backgroundColor,
        borderColor: theme.secondaryShade,
        color: theme.textColor,
      }}
      {...props}
    />
  );
});

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

// Shortcut Component
type DropdownMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement> & {
  scale?: SpaceVariantType;
};

const DropdownMenuShortcut = ({
  className,
  scale = "lg",
  ...props
}: DropdownMenuShortcutProps) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-xs";
      case "xl":
        return "text-sm";
      default:
        return "text-xs";
    }
  };

  return (
    <span
      className={cn(
        "ml-auto tracking-widest opacity-60",
        getScaleStyles(),
        className
      )}
      style={{
        color: theme.textDimmed,
      }}
      {...props}
    />
  );
};

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

// Header Component
type DropdownMenuHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  scale?: SpaceVariantType;
  icon?: React.ReactNode;
  title: string;
  description?: string;
};

const DropdownMenuHeader = ({
  className,
  scale = "lg",
  icon,
  title,
  description,
  ...props
}: DropdownMenuHeaderProps) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-2 gap-2";
      case "lg":
        return "px-3 py-3 gap-3";
      case "xl":
        return "px-4 py-4 gap-4";
      default:
        return "px-3 py-3 gap-3";
    }
  };

  const getTitleStyles = () => {
    switch (scale) {
      case "sm":
        return "text-sm font-semibold";
      case "lg":
        return "text-base font-semibold";
      case "xl":
        return "text-lg font-semibold";
      default:
        return "text-base font-semibold";
    }
  };

  const getDescriptionStyles = () => {
    switch (scale) {
      case "sm":
        return "text-xs";
      case "lg":
        return "text-sm";
      case "xl":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  return (
    <div
      className={cn("flex items-start border-b", getScaleStyles(), className)}
      style={{
        borderBottomColor: theme.secondaryShade,
      }}
      {...props}
    >
      {icon && (
        <div
          className="flex-shrink-0 mt-0.5"
          style={{ color: theme.primaryColor }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <h4 className={getTitleStyles()} style={{ color: theme.textColor }}>
          {title}
        </h4>
        {description && (
          <p
            className={cn("opacity-70", getDescriptionStyles())}
            style={{ color: theme.textColor }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

DropdownMenuHeader.displayName = "DropdownMenuHeader";

// Badge Component
type DropdownMenuBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  scale?: SpaceVariantType;
  variant?: "default" | "success" | "warning" | "error" | "info";
};

const DropdownMenuBadge = ({
  className,
  scale = "lg",
  variant = "default",
  children,
  ...props
}: DropdownMenuBadgeProps) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-1.5 py-0.5 text-xs";
      case "lg":
        return "px-2 py-1 text-xs";
      case "xl":
        return "px-2.5 py-1 text-sm";
      default:
        return "px-2 py-1 text-xs";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: `${theme.primaryColor}20`,
          color: theme.primaryColor,
        };
      case "warning":
        return { backgroundColor: "#fbbf2420", color: "#fbbf24" };
      case "error":
        return { backgroundColor: "#ef444420", color: "#ef4444" };
      case "info":
        return { backgroundColor: "#3b82f620", color: "#3b82f6" };
      default:
        return {
          backgroundColor: theme.secondaryShade,
          color: theme.textColor,
        };
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        getScaleStyles(),
        className
      )}
      style={getVariantStyles()}
      {...props}
    >
      {children}
    </span>
  );
};

DropdownMenuBadge.displayName = "DropdownMenuBadge";

// Nested Component (Advanced Sub-menu with custom styling)
type DropdownMenuNestedProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  scale?: SpaceVariantType;
  className?: string;
};

const DropdownMenuNested = ({
  trigger,
  children,
  scale = "lg",
  className,
}: DropdownMenuNestedProps) => {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger scale={scale} className={className}>
        {trigger}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent scale={scale}>{children}</DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};

DropdownMenuNested.displayName = "DropdownMenuNested";

// Pinnable Component
type DropdownMenuPinnableProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> & {
  scale?: SpaceVariantType;
  icon?: React.ReactNode;
  pinned?: boolean;
  onPinChange?: (pinned: boolean) => void;
};

const DropdownMenuPinnable = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuPinnableProps
>(
  (
    {
      className,
      scale = "lg",
      icon,
      pinned = false,
      onPinChange,
      children,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return "px-2 py-1 text-xs gap-1";
        case "lg":
          return "px-2 py-1.5 text-sm gap-2";
        case "xl":
          return "px-3 py-2 text-base gap-3";
        default:
          return "px-2 py-1.5 text-sm gap-2";
      }
    };

    const handlePinClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onPinChange?.(!pinned);
    };

    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm outline-none transition-colors duration-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          getScaleStyles(),
          className
        )}
        style={{
          color: theme.textColor,
          backgroundColor: pinned ? `${theme.primaryColor}10` : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!pinned) {
            e.currentTarget.style.backgroundColor = `${theme.primaryShade}40`;
          }
        }}
        onMouseLeave={(e) => {
          if (!pinned) {
            e.currentTarget.style.backgroundColor = "transparent";
          } else {
            e.currentTarget.style.backgroundColor = `${theme.primaryColor}10`;
          }
        }}
        {...props}
      >
        {icon && <span>{icon}</span>}
        <span className="flex-1">{children}</span>
        <button
          onClick={handlePinClick}
          className="ml-auto p-1 rounded-sm hover:bg-opacity-20 transition-colors"
          style={{
            color: pinned ? theme.primaryColor : theme.secondaryColor,
          }}
        >
          {pinned ? (
            <Pin className="h-3 w-3" />
          ) : (
            <PinOff className="h-3 w-3" />
          )}
        </button>
      </DropdownMenuPrimitive.Item>
    );
  }
);

DropdownMenuPinnable.displayName = "DropdownMenuPinnable";

// Command Component (with search functionality)
type DropdownMenuCommandProps = {
  children: React.ReactNode;
  scale?: SpaceVariantType;
  placeholder?: string;
  onSearchChange?: (value: string) => void;
};

const DropdownMenuCommand = ({
  children,
  scale = "lg",
  placeholder = "Search...",
  onSearchChange,
}: DropdownMenuCommandProps) => {
  const [searchValue, setSearchValue] = useState("");
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-3 py-2 text-sm";
      case "xl":
        return "px-4 py-3 text-base";
      default:
        return "px-3 py-2 text-sm";
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <div className="flex flex-col">
      <div
        className={cn("flex items-center border-b", getScaleStyles())}
        style={{ borderBottomColor: theme.secondaryShade }}
      >
        <Search
          className="h-4 w-4 mr-2"
          style={{ color: theme.secondaryColor }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none"
          style={{ color: theme.textColor }}
        />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

DropdownMenuCommand.displayName = "DropdownMenuCommand";

// Category Component
type DropdownMenuCategoryProps = React.HTMLAttributes<HTMLDivElement> & {
  scale?: SpaceVariantType;
  title: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

const DropdownMenuCategory = ({
  className,
  scale = "lg",
  title,
  icon,
  collapsible = false,
  defaultCollapsed = false,
  children,
  ...props
}: DropdownMenuCategoryProps) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-1 text-xs gap-1";
      case "lg":
        return "px-2 py-1.5 text-sm gap-2";
      case "xl":
        return "px-3 py-2 text-base gap-3";
      default:
        return "px-2 py-1.5 text-sm gap-2";
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div
        className={cn(
          "flex items-center font-semibold cursor-pointer",
          getScaleStyles(),
          collapsible && "hover:bg-opacity-10"
        )}
        style={{
          color: theme.primaryColor,
          backgroundColor: collapsible ? "transparent" : undefined,
        }}
        onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        onMouseEnter={
          collapsible
            ? (e) => {
                e.currentTarget.style.backgroundColor = `${theme.primaryShade}20`;
              }
            : undefined
        }
        onMouseLeave={
          collapsible
            ? (e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            : undefined
        }
      >
        {icon && <span>{icon}</span>}
        <span className="flex-1">{title}</span>
        {collapsible && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed ? "rotate-0" : "rotate-90"
            )}
            style={{ color: theme.secondaryColor }}
          />
        )}
      </div>
      <AnimatePresence>
        {(!collapsible || !collapsed) && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

DropdownMenuCategory.displayName = "DropdownMenuCategory";

// Footer Component
type DropdownMenuFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  scale?: SpaceVariantType;
  actions?: React.ReactNode;
};

const DropdownMenuFooter = ({
  className,
  scale = "lg",
  actions,
  children,
  ...props
}: DropdownMenuFooterProps) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-2 gap-2";
      case "lg":
        return "px-3 py-3 gap-3";
      case "xl":
        return "px-4 py-4 gap-4";
      default:
        return "px-3 py-3 gap-3";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t",
        getScaleStyles(),
        className
      )}
      style={{
        borderTopColor: theme.secondaryShade,
        backgroundColor: `${theme.secondaryShade}20`,
      }}
      {...props}
    >
      {children && <div style={{ color: theme.textDimmed }}>{children}</div>}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

DropdownMenuFooter.displayName = "DropdownMenuFooter";

// Search Component (standalone search input)
type DropdownMenuSearchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  scale?: SpaceVariantType;
  icon?: React.ReactNode;
};

const DropdownMenuSearch = React.forwardRef<
  HTMLInputElement,
  DropdownMenuSearchProps
>(({ className, scale = "lg", icon, ...props }, ref) => {
  const { theme } = useTheme();

  const getScaleStyles = () => {
    switch (scale) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-3 py-2 text-sm";
      case "xl":
        return "px-4 py-3 text-base";
      default:
        return "px-3 py-2 text-sm";
    }
  };

  return (
    <div
      className={cn("flex items-center border-b", getScaleStyles(), className)}
      style={{ borderBottomColor: theme.secondaryShade }}
    >
      {icon || (
        <Search
          className="h-4 w-4 mr-2"
          style={{ color: theme.secondaryColor }}
        />
      )}
      <input
        ref={ref}
        type="text"
        className="flex-1 bg-transparent outline-none placeholder:text-[color:var(--text-dimmed)]"
        style={{
          color: theme.textColor,
        }}
        {...props}
      />
    </div>
  );
});

DropdownMenuSearch.displayName = "DropdownMenuSearch";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuHeader,
  DropdownMenuBadge,
  DropdownMenuNested,
  DropdownMenuPinnable,
  DropdownMenuCommand,
  DropdownMenuCategory,
  DropdownMenuFooter,
  DropdownMenuSearch,
};
