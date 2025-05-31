import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type ButtonProps = Omit<React.ComponentProps<typeof motion.button>, "ref"> & {
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: React.ReactNode;
  outline?: boolean;
  Icon?: React.ElementType;
  iconPosition?: "left" | "right";
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
   onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      fullWidth = false,
      disabled = false,
      loading = false,
      loadingText,
      outline = false,
      Icon,
      iconPosition = "left",
      variant = "default",
      scale = "lg",
      onClick,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(event);
      }
    };

    // Render based on design variant
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <motion.div
                className={cn("relative inline-block", fullWidth && "w-full block")}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Hover/Focus background */}
                <AnimatePresence>
                  {(isHovered || isPressed) && !disabled && !loading && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-md"
                      style={{
                        backgroundColor: outline
                          ? `${theme.primaryColor}10`
                          : `${theme.primaryColor}20`,
                        border: outline
                          ? `1px solid ${theme.primaryColor}40`
                          : "none",
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: isPressed ? 0.8 : 0.6,
                        scale: isPressed ? 0.98 : 1.02,
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  ref={ref}
                  onClick={handleClick}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 outline-none",
                    fullWidth && "w-full",
                    (disabled || loading) && "cursor-not-allowed",
                    className
                  )}
                  style={{
                    backgroundColor: outline
                      ? "transparent"
                      : disabled || loading
                      ? `${theme.secondaryColor}20`
                      : theme.backgroundColor,
                    color:
                      disabled || loading
                        ? `${theme.textColor}60`
                        : outline
                        ? theme.primaryColor
                        : theme.textColor,
                    border: outline
                      ? `1px solid ${theme.primaryColor}${
                          disabled || loading ? "40" : "70"
                        }`
                      : `1px solid ${theme.secondaryColor}${
                          disabled || loading ? "20" : "40"
                        }`,
                    boxShadow:
                      disabled || loading
                        ? "none"
                        : `0 1px 2px ${theme.secondaryShade}40`,
                  }}
                  disabled={disabled || loading}
                  whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
                  {...props}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={12} />
                      </motion.div>
                      {loadingText || children}
                    </motion.div>
                  ) : (
                    <>
                      {Icon && iconPosition === "left" && (
                        <motion.div
                          initial={{ opacity: 0, x: -2 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={12} strokeWidth={1.5} />
                        </motion.div>
                      )}
                      <span>{children}</span>
                      {Icon && iconPosition === "right" && (
                        <motion.div
                          initial={{ opacity: 0, x: 2 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={12} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.button>
              </motion.div>
            );

          case "lg":
            return (
              <motion.div
                className={cn("relative inline-block", fullWidth && "w-full block")}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Hover/Focus background */}
                <AnimatePresence>
                  {(isHovered || isPressed) && !disabled && !loading && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        backgroundColor: outline
                          ? `${theme.primaryColor}10`
                          : `${theme.primaryColor}20`,
                        border: outline
                          ? `1px solid ${theme.primaryColor}40`
                          : "none",
                        boxShadow: `0 2px 4px ${theme.secondaryShade}30`,
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: isPressed ? 0.8 : 0.6,
                        scale: isPressed ? 0.98 : 1.02,
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  ref={ref}
                  onClick={handleClick}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 outline-none",
                    fullWidth && "w-full",
                    (disabled || loading) && "cursor-not-allowed",
                    className
                  )}
                  style={{
                    backgroundColor: outline
                      ? "transparent"
                      : disabled || loading
                      ? `${theme.secondaryColor}20`
                      : theme.backgroundColor,
                    color:
                      disabled || loading
                        ? `${theme.textColor}60`
                        : outline
                        ? theme.primaryColor
                        : theme.textColor,
                    border: outline
                      ? `1px solid ${theme.primaryColor}${
                          disabled || loading ? "40" : "70"
                        }`
                      : `1px solid ${theme.secondaryColor}${
                          disabled || loading ? "20" : "40"
                        }`,
                    boxShadow:
                      disabled || loading
                        ? "none"
                        : `0 1px 2px ${theme.secondaryShade}40`,
                  }}
                  disabled={disabled || loading}
                  whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
                  {...props}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={16} />
                      </motion.div>
                      {loadingText || children}
                    </motion.div>
                  ) : (
                    <>
                      {Icon && iconPosition === "left" && (
                        <motion.div
                          initial={{ opacity: 0, x: -3 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                        </motion.div>
                      )}
                      <span>{children}</span>
                      {Icon && iconPosition === "right" && (
                        <motion.div
                          initial={{ opacity: 0, x: 3 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.button>
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                className={cn("relative inline-block", fullWidth && "w-full block")}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Hover/Focus background */}
                <AnimatePresence>
                  {(isHovered || isPressed) && !disabled && !loading && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none rounded-xl"
                      style={{
                        backgroundColor: outline
                          ? `${theme.primaryColor}10`
                          : `${theme.primaryColor}20`,
                        border: outline
                          ? `2px solid ${theme.primaryColor}40`
                          : "none",
                        boxShadow: `0 4px 6px ${theme.secondaryShade}30`,
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: isPressed ? 0.8 : 0.6,
                        scale: isPressed ? 0.98 : 1.02,
                      }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  ref={ref}
                  onClick={handleClick}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  className={cn(
                    "relative z-10 flex items-center justify-center gap-3 px-5 py-4 text-base font-medium rounded-xl transition-all duration-200 outline-none",
                    fullWidth && "w-full",
                    (disabled || loading) && "cursor-not-allowed",
                    className
                  )}
                  style={{
                    backgroundColor: outline
                      ? "transparent"
                      : disabled || loading
                      ? `${theme.secondaryColor}20`
                      : theme.backgroundColor,
                    color:
                      disabled || loading
                        ? `${theme.textColor}60`
                        : outline
                        ? theme.primaryColor
                        : theme.textColor,
                    border: outline
                      ? `2px solid ${theme.primaryColor}${
                          disabled || loading ? "40" : "70"
                        }`
                      : `2px solid ${theme.secondaryColor}${
                          disabled || loading ? "20" : "40"
                        }`,
                    boxShadow:
                      disabled || loading
                        ? "none"
                        : `0 2px 4px ${theme.secondaryShade}40`,
                  }}
                  disabled={disabled || loading}
                  whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
                  whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
                  {...props}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={20} />
                      </motion.div>
                      {loadingText || children}
                    </motion.div>
                  ) : (
                    <>
                      {Icon && iconPosition === "left" && (
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                        </motion.div>
                      )}
                      <span>{children}</span>
                      {Icon && iconPosition === "right" && (
                        <motion.div
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.button>
              </motion.div>
            );

          default:
            return null;
        }

      case "minimal":
        switch (scale) {
          case "sm":
            return (
              <motion.div
                className={cn("relative inline-block", fullWidth && "w-full block")}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.button
                  ref={ref}
                  onClick={handleClick}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  className={cn(
                    "relative flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium transition-all duration-200 outline-none border-b hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    fullWidth && "w-full",
                    className
                  )}
                  style={{
                    backgroundColor: "transparent",
                    color:
                      disabled || loading
                        ? `${theme.textColor}50`
                        : theme.textColor,
                    borderBottomColor:
                      isHovered && !disabled && !loading
                        ? theme.primaryColor
                        : `${theme.secondaryColor}40`,
                    borderBottomWidth: "1px",
                  }}
                  disabled={disabled || loading}
                  whileHover={!disabled && !loading ? { y: -1 } : {}}
                  whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : {}}
                  {...props}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center gap-1.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={12} />
                      </motion.div>
                      {loadingText || children}
                    </motion.div>
                  ) : (
                    <>
                      {Icon && iconPosition === "left" && (
                        <motion.div
                          initial={{ opacity: 0, x: -2 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={12} strokeWidth={1.5} />
                        </motion.div>
                      )}
                      <span>{children}</span>
                      {Icon && iconPosition === "right" && (
                        <motion.div
                          initial={{ opacity: 0, x: 2 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={12} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.button>
              </motion.div>
            );

          case "lg":
            return (
              <motion.div
                className={cn("relative inline-block", fullWidth && "w-full block")}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.button
                  ref={ref}
                  onClick={handleClick}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  className={cn(
                    "relative flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 outline-none border-b hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    fullWidth && "w-full",
                    className
                  )}
                  style={{
                    backgroundColor: "transparent",
                    color:
                      disabled || loading
                        ? `${theme.textColor}50`
                        : theme.textColor,
                    borderBottomColor:
                      isHovered && !disabled && !loading
                        ? theme.primaryColor
                        : `${theme.secondaryColor}40`,
                    borderBottomWidth: "1px",
                  }}
                  disabled={disabled || loading}
                  whileHover={!disabled && !loading ? { y: -2 } : {}}
                  whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : {}}
                  {...props}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={16} />
                      </motion.div>
                      {loadingText || children}
                    </motion.div>
                  ) : (
                    <>
                      {Icon && iconPosition === "left" && (
                        <motion.div
                          initial={{ opacity: 0, x: -3 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                        </motion.div>
                      )}
                      <span>{children}</span>
                      {Icon && iconPosition === "right" && (
                        <motion.div
                          initial={{ opacity: 0, x: 3 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={16} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.button>
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                className={cn("relative inline-block", fullWidth && "w-full block")}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.button
                  ref={ref}
                  onClick={handleClick}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  className={cn(
                    "relative flex items-center justify-center gap-3 px-4 py-3 text-base font-medium transition-all duration-200 outline-none border-b-2 hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
                    fullWidth && "w-full",
                    className
                  )}
                  style={{
                    backgroundColor: "transparent",
                    color:
                      disabled || loading
                        ? `${theme.textColor}50`
                        : theme.textColor,
                    borderBottomColor:
                      isHovered && !disabled && !loading
                        ? theme.primaryColor
                        : `${theme.secondaryColor}40`,
                  }}
                  disabled={disabled || loading}
                  whileHover={!disabled && !loading ? { y: -3 } : {}}
                  whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : {}}
                  {...props}
                >
                  {loading ? (
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "linear",
                        }}
                      >
                        <Loader2 size={20} />
                      </motion.div>
                      {loadingText || children}
                    </motion.div>
                  ) : (
                    <>
                      {Icon && iconPosition === "left" && (
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                        </motion.div>
                      )}
                      <span>{children}</span>
                      {Icon && iconPosition === "right" && (
                        <motion.div
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.button>
              </motion.div>
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }
);

Button.displayName = "Button";

export { Button };