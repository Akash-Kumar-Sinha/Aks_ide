import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash, AlertCircle, CheckCircle2, Info } from "lucide-react";
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

type ValidationState = "default" | "success" | "warning" | "error" | "info";

type ResizeType = "none" | "both" | "horizontal" | "vertical";

type TextareaProps = ExcludeMotionConflicts<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
> & {
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  validationState?: ValidationState;
  helperText?: string;
  label?: string;
  required?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
  resizable?: ResizeType;
  autoResize?: boolean;
  minHeight?: string | number;
  maxHeight?: string | number;
  scrollVariant?: ScrollVariantType;
  glowEffect?: boolean;
  animateOnMount?: boolean;
  floatingLabel?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  containerClassName?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      containerClassName,
      variant = "default",
      scale = "lg",
      validationState = "default",
      helperText,
      label,
      required = false,
      showCharacterCount = false,
      maxLength,
      resizable = "vertical",
      autoResize = false,
      minHeight,
      maxHeight,
      scrollVariant = "default",
      glowEffect = false,
      animateOnMount = true,
      floatingLabel = false,
      showClearButton = false,
      onClear,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled,
      placeholder,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [hasValue, setHasValue] = useState(
      Boolean(value || props.defaultValue)
    );
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Use passed ref or internal ref
    const combinedRef = ref || textareaRef;

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const handleClear = () => {
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.focus();
        setHasValue(false);
      }
      onClear?.();
    };

    const getScaleStyles = () => {
      switch (scale) {
        case "sm":
          return {
            borderRadius: "0.5rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.75rem",
            minHeight: minHeight || "60px",
          };
        case "lg":
          return {
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            minHeight: minHeight || "80px",
          };
        case "xl":
          return {
            borderRadius: "1rem",
            padding: "1rem 1.25rem",
            fontSize: "1rem",
            minHeight: minHeight || "100px",
          };
        default:
          return {
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.875rem",
            minHeight: minHeight || "80px",
          };
      }
    };

    const getValidationStyles = () => {
      switch (validationState) {
        case "success":
          return {
            borderColor: theme.successColor,
            focusBorderColor: theme.successColor,
            glowColor: theme.successColor,
          };
        case "warning":
          return {
            borderColor: theme.warningColor,
            focusBorderColor: theme.warningColor,
            glowColor: theme.warningColor,
          };
        case "error":
          return {
            borderColor: theme.errorColor,
            focusBorderColor: theme.errorColor,
            glowColor: theme.errorColor,
          };
        case "info":
          return {
            borderColor: theme.infoColor,
            focusBorderColor: theme.infoColor,
            glowColor: theme.infoColor,
          };
        default:
          return {
            borderColor: `${theme.secondaryColor}40`,
            focusBorderColor: theme.primaryColor,
            glowColor: theme.primaryColor,
          };
      }
    };

    const getVariantStyles = () => {
      const baseStyles = getScaleStyles();
      const validationStyles = getValidationStyles();

      switch (variant) {
        case "default":
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${
              isFocused
                ? validationStyles.focusBorderColor
                : validationStyles.borderColor
            }`,
            boxShadow: isFocused
              ? `0 0 0 2px ${validationStyles.glowColor}20`
              : isHovered
              ? `0 2px 8px -2px ${theme.secondaryShade}30`
              : `0 1px 3px -1px ${theme.secondaryShade}20`,
            ...(glowEffect && {
              boxShadow: `0 0 20px ${validationStyles.glowColor}20, ${
                isFocused
                  ? `0 0 0 2px ${validationStyles.glowColor}20`
                  : isHovered
                  ? `0 2px 8px -2px ${theme.secondaryShade}30`
                  : `0 1px 3px -1px ${theme.secondaryShade}20`
              }`,
            }),
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: theme.textColor,
            border: "none",
            borderBottom: `2px solid ${
              isFocused
                ? validationStyles.focusBorderColor
                : validationStyles.borderColor
            }`,
            borderRadius: "0",
            boxShadow: "none",
          };

        default:
          return {
            ...baseStyles,
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            border: `1px solid ${validationStyles.borderColor}`,
            boxShadow: `0 1px 3px -1px ${theme.secondaryShade}20`,
          };
      }
    };

    // Generate scrollbar classes
    const getScrollbarClasses = () => {
      const classes = ["scrollable-container"];

      if (scrollVariant !== "default") {
        classes.push(`scrollable-${scrollVariant}`);
      }

      classes.push("scroll-vertical");
      classes.push(`scrollable-${scale}`);
      classes.push("scrollable-responsive");

      return classes.join(" ");
    };

    // Get resize styles
    const getResizeStyles = () => {
      const styles: React.CSSProperties = {};

      switch (resizable) {
        case "none":
          styles.resize = "none";
          break;
        case "both":
          styles.resize = "both";
          break;
        case "horizontal":
          styles.resize = "horizontal";
          break;
        case "vertical":
          styles.resize = "vertical";
          break;
        default:
          styles.resize = "vertical";
      }

      if (maxHeight) {
        styles.maxHeight =
          typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;
      }

      return styles;
    };

    const getValidationIcon = () => {
      switch (validationState) {
        case "success":
          return <CheckCircle2 size={16} color={theme.successColor} />;
        case "warning":
          return <AlertCircle size={16} color={theme.warningColor} />;
        case "error":
          return <AlertCircle size={16} color={theme.errorColor} />;
        case "info":
          return <Info size={16} color={theme.infoColor} />;
        default:
          return null;
      }
    };

    const getLabelStyles = () => {
      const baseSize =
        scale === "sm" ? "0.75rem" : scale === "xl" ? "1rem" : "0.875rem";

      if (floatingLabel) {
        return {
          fontSize: isFocused || hasValue ? "0.75rem" : baseSize,
          color: isFocused
            ? getValidationStyles().focusBorderColor
            : theme.textDimmed,
          transform:
            isFocused || hasValue
              ? "translateY(-0.5rem) scale(0.9)"
              : "translateY(0) scale(1)",
          transformOrigin: "left",
          transition: "all 0.2s ease-in-out",
        };
      }

      return {
        fontSize: baseSize,
        color: theme.textColor,
      };
    };

    const characterCount = typeof value === "string" ? value.length : 0;
    const showCharCount =
      showCharacterCount && (maxLength || characterCount > 0);

    return (
      <motion.div
        className={cn("relative w-full", containerClassName)}
        initial={animateOnMount ? { opacity: 0, y: 10 } : {}}
        animate={animateOnMount ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Label */}
        {label && (
          <motion.label
            className={cn(
              "block mb-2 font-medium transition-all duration-200",
              floatingLabel && "absolute left-3 top-3 pointer-events-none z-10"
            )}
            style={getLabelStyles()}
          >
            {label}
            {required && (
              <span style={{ color: theme.errorColor }} className="ml-1">
                *
              </span>
            )}
          </motion.label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          <motion.textarea
            ref={combinedRef}
            className={cn(
              "w-full transition-all duration-200 outline-none",
              getScrollbarClasses(),
              disabled && "cursor-not-allowed opacity-50",
              floatingLabel && label && "pt-6",
              className
            )}
            style={{
              ...getVariantStyles(),
              ...getResizeStyles(),
              "::placeholder": {
                color: theme.textDimmed,
                opacity: 0.6,
              },
            }}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={disabled}
            placeholder={floatingLabel ? "" : placeholder}
            maxLength={maxLength}
            whileFocus={{ scale: 1.01 }}
            {...props}
          />

          {/* Right side icons */}
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {getValidationIcon()}

            {showClearButton && hasValue && !disabled && (
              <motion.button
                type="button"
                onClick={handleClear}
                className="p-1 rounded hover:bg-opacity-10"
                style={{
                  color: theme.textDimmed,
                  backgroundColor: `${theme.secondaryColor}10`,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash size={14} />
              </motion.button>
            )}
          </div>
        </div>

        {/* Helper text and character count */}
        <AnimatePresence>
          {(helperText || showCharCount) && (
            <motion.div
              className={cn(
                "flex justify-between items-center mt-2 text-xs",
                scale === "sm" && "text-xs",
                scale === "xl" && "text-sm"
              )}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {helperText && (
                <span
                  style={{
                    color:
                      validationState === "error"
                        ? theme.errorColor
                        : validationState === "warning"
                        ? theme.warningColor
                        : validationState === "success"
                        ? theme.successColor
                        : validationState === "info"
                        ? theme.infoColor
                        : theme.textDimmed,
                  }}
                >
                  {helperText}
                </span>
              )}

              {showCharCount && (
                <span
                  style={{
                    color:
                      maxLength && characterCount > maxLength * 0.9
                        ? theme.warningColor
                        : theme.textDimmed,
                  }}
                >
                  {characterCount}
                  {maxLength && `/${maxLength}`}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
export type { TextareaProps, ValidationState, ResizeType };
