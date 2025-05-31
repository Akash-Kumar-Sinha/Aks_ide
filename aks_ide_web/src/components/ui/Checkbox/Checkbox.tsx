import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import useTheme from "../lib/useTheme";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type CheckboxProps = Omit<React.ComponentProps<"input">, "ref" | "type" | "onChange"> & {
  label?: React.ReactNode;
  description?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  // Support both custom boolean onChange and standard React onChange
  onChange?: (checked: boolean) => void;
  onChangeEvent?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  Icon?: React.ElementType;
};

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      checked = false,
      disabled = false,
      variant = "default",
      scale = "lg",
      onChange,
      onChangeEvent,
      Icon = Check,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        const newChecked = event.target.checked;
        
        // Call the boolean onChange if provided
        if (onChange) {
          onChange(newChecked);
        }
        
        // Call the event onChange if provided
        if (onChangeEvent) {
          onChangeEvent(event);
        }
      }
    };

    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    // Render based on design variant
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <motion.div
                className={cn("relative flex items-start gap-2", className)}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="relative">
                  {/* Hover/Focus background */}
                  <AnimatePresence>
                    {(isHovered || isPressed) && !disabled && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-sm"
                        style={{
                          backgroundColor: `${theme.primaryColor}10`,
                          border: `1px solid ${theme.primaryColor}40`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isPressed ? 0.8 : 0.6,
                          scale: isPressed ? 0.95 : 1.1,
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="relative z-10 flex items-center justify-center w-4 h-4 rounded-sm border transition-all duration-200"
                    style={{
                      backgroundColor: checked
                        ? theme.primaryColor
                        : disabled
                        ? `${theme.secondaryColor}20`
                        : theme.backgroundColor,
                      borderColor: checked
                        ? theme.primaryColor
                        : disabled
                        ? `${theme.secondaryColor}40`
                        : `${theme.secondaryColor}60`,
                      boxShadow:
                        checked && !disabled
                          ? `0 1px 2px ${theme.primaryShade}40`
                          : "none",
                    }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onTap={() => {
                      setIsPressed(true);
                      setTimeout(() => setIsPressed(false), 150);
                    }}
                    whileHover={!disabled ? { scale: 1.05 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                  >
                    <input
                      ref={ref}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={handleChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      {...props}
                    />

                    <AnimatePresence>
                      {checked && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            size={10}
                            strokeWidth={2}
                            style={{
                              color: disabled
                                ? `${theme.textColor}60`
                                : theme.backgroundColor,
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {(label || description) && (
                  <div className="flex flex-col gap-0.5">
                    {label && (
                      <motion.label
                        className="text-xs font-medium cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          color: disabled
                            ? `${theme.textColor}60`
                            : theme.textColor,
                        }}
                        onClick={!disabled ? handleClick : undefined}
                        initial={{ opacity: 0, x: -2 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.label>
                    )}
                    {description && (
                      <motion.p
                        className="text-xs"
                        style={{
                          color: disabled
                            ? `${theme.textDimmed}60`
                            : theme.textDimmed,
                        }}
                        initial={{ opacity: 0, x: -2 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            );

          case "lg":
            return (
              <motion.div
                className={cn("relative flex items-start gap-3", className)}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="relative">
                  {/* Hover/Focus background */}
                  <AnimatePresence>
                    {(isHovered || isPressed) && !disabled && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-md"
                        style={{
                          backgroundColor: `${theme.primaryColor}10`,
                          border: `1px solid ${theme.primaryColor}40`,
                          boxShadow: `0 2px 4px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isPressed ? 0.8 : 0.6,
                          scale: isPressed ? 0.95 : 1.1,
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="relative z-10 flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-200"
                    style={{
                      backgroundColor: checked
                        ? theme.primaryColor
                        : disabled
                        ? `${theme.secondaryColor}20`
                        : theme.backgroundColor,
                      borderColor: checked
                        ? theme.primaryColor
                        : disabled
                        ? `${theme.secondaryColor}40`
                        : `${theme.secondaryColor}60`,
                      boxShadow:
                        checked && !disabled
                          ? `0 1px 2px ${theme.primaryShade}40`
                          : "none",
                    }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onTap={() => {
                      setIsPressed(true);
                      setTimeout(() => setIsPressed(false), 150);
                    }}
                    whileHover={!disabled ? { scale: 1.05 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                  >
                    <input
                      ref={ref}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={handleChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      {...props}
                    />

                    <AnimatePresence>
                      {checked && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            size={12}
                            strokeWidth={2}
                            style={{
                              color: disabled
                                ? `${theme.textColor}60`
                                : theme.backgroundColor,
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {(label || description) && (
                  <div className="flex flex-col gap-1">
                    {label && (
                      <motion.label
                        className="text-sm font-medium cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          color: disabled
                            ? `${theme.textColor}60`
                            : theme.textColor,
                        }}
                        onClick={!disabled ? handleClick : undefined}
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.label>
                    )}
                    {description && (
                      <motion.p
                        className="text-sm"
                        style={{
                          color: disabled
                            ? `${theme.textDimmed}60`
                            : theme.textDimmed,
                        }}
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                className={cn("relative flex items-start gap-4", className)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="relative">
                  {/* Hover/Focus background */}
                  <AnimatePresence>
                    {(isHovered || isPressed) && !disabled && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-lg"
                        style={{
                          backgroundColor: `${theme.primaryColor}10`,
                          border: `2px solid ${theme.primaryColor}40`,
                          boxShadow: `0 4px 6px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: isPressed ? 0.8 : 0.6,
                          scale: isPressed ? 0.95 : 1.1,
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="relative z-10 flex items-center justify-center w-6 h-6 rounded-lg border-2 transition-all duration-200"
                    style={{
                      backgroundColor: checked
                        ? theme.primaryColor
                        : disabled
                        ? `${theme.secondaryColor}20`
                        : theme.backgroundColor,
                      borderColor: checked
                        ? theme.primaryColor
                        : disabled
                        ? `${theme.secondaryColor}40`
                        : `${theme.secondaryColor}60`,
                      boxShadow:
                        checked && !disabled
                          ? `0 2px 4px ${theme.primaryShade}40`
                          : "none",
                    }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    onTap={() => {
                      setIsPressed(true);
                      setTimeout(() => setIsPressed(false), 150);
                    }}
                    whileHover={!disabled ? { scale: 1.05 } : {}}
                    whileTap={!disabled ? { scale: 0.95 } : {}}
                  >
                    <input
                      ref={ref}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={handleChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      {...props}
                    />

                    <AnimatePresence>
                      {checked && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            size={14}
                            strokeWidth={2}
                            style={{
                              color: disabled
                                ? `${theme.textColor}60`
                                : theme.backgroundColor,
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {(label || description) && (
                  <div className="flex flex-col gap-1.5">
                    {label && (
                      <motion.label
                        className="text-base font-medium cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          color: disabled
                            ? `${theme.textColor}60`
                            : theme.textColor,
                        }}
                        onClick={!disabled ? handleClick : undefined}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.label>
                    )}
                    {description && (
                      <motion.p
                        className="text-base"
                        style={{
                          color: disabled
                            ? `${theme.textDimmed}60`
                            : theme.textDimmed,
                        }}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                )}
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
                className={cn("relative flex items-start gap-2", className)}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.div
                  className="relative flex items-center justify-center w-4 h-4 border-b transition-all duration-200"
                  style={{
                    backgroundColor: "transparent",
                    borderBottomColor:
                      checked && !disabled
                        ? theme.primaryColor
                        : isHovered && !disabled
                        ? theme.primaryColor
                        : `${theme.secondaryColor}40`,
                    borderBottomWidth: "1px",
                  }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  whileHover={!disabled ? { y: -1 } : {}}
                  whileTap={!disabled ? { scale: 0.95, y: 0 } : {}}
                >
                  <input
                    ref={ref}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    {...props}
                  />

                  <AnimatePresence>
                    {checked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon
                          size={10}
                          strokeWidth={2}
                          style={{
                            color: disabled
                              ? `${theme.textColor}50`
                              : theme.primaryColor,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {(label || description) && (
                  <div className="flex flex-col gap-0.5">
                    {label && (
                      <motion.label
                        className="text-xs font-medium cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          color: disabled
                            ? `${theme.textColor}50`
                            : theme.textColor,
                        }}
                        onClick={!disabled ? handleClick : undefined}
                        initial={{ opacity: 0, x: -2 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.label>
                    )}
                    {description && (
                      <motion.p
                        className="text-xs"
                        style={{
                          color: disabled
                            ? `${theme.textDimmed}50`
                            : theme.textDimmed,
                        }}
                        initial={{ opacity: 0, x: -2 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            );

          case "lg":
            return (
              <motion.div
                className={cn("relative flex items-start gap-3", className)}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.div
                  className="relative flex items-center justify-center w-5 h-5 border-b transition-all duration-200"
                  style={{
                    backgroundColor: "transparent",
                    borderBottomColor:
                      checked && !disabled
                        ? theme.primaryColor
                        : isHovered && !disabled
                        ? theme.primaryColor
                        : `${theme.secondaryColor}40`,
                    borderBottomWidth: "1px",
                  }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  whileHover={!disabled ? { y: -2 } : {}}
                  whileTap={!disabled ? { scale: 0.95, y: 0 } : {}}
                >
                  <input
                    ref={ref}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    {...props}
                  />

                  <AnimatePresence>
                    {checked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon
                          size={12}
                          strokeWidth={2}
                          style={{
                            color: disabled
                              ? `${theme.textColor}50`
                              : theme.primaryColor,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {(label || description) && (
                  <div className="flex flex-col gap-1">
                    {label && (
                      <motion.label
                        className="text-sm font-medium cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          color: disabled
                            ? `${theme.textColor}50`
                            : theme.textColor,
                        }}
                        onClick={!disabled ? handleClick : undefined}
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.label>
                    )}
                    {description && (
                      <motion.p
                        className="text-sm"
                        style={{
                          color: disabled
                            ? `${theme.textDimmed}50`
                            : theme.textDimmed,
                        }}
                        initial={{ opacity: 0, x: -3 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                )}
              </motion.div>
            );

          case "xl":
            return (
              <motion.div
                className={cn("relative flex items-start gap-4", className)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.div
                  className="relative flex items-center justify-center w-6 h-6 border-b-2 transition-all duration-200"
                  style={{
                    backgroundColor: "transparent",
                    borderBottomColor:
                      checked && !disabled
                        ? theme.primaryColor
                        : isHovered && !disabled
                        ? theme.primaryColor
                        : `${theme.secondaryColor}40`,
                  }}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                  onTap={() => {
                    setIsPressed(true);
                    setTimeout(() => setIsPressed(false), 150);
                  }}
                  whileHover={!disabled ? { y: -3 } : {}}
                  whileTap={!disabled ? { scale: 0.95, y: 0 } : {}}
                >
                  <input
                    ref={ref}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    {...props}
                  />

                  <AnimatePresence>
                    {checked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.3 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon
                          size={14}
                          strokeWidth={2}
                          style={{
                            color: disabled
                              ? `${theme.textColor}50`
                              : theme.primaryColor,
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {(label || description) && (
                  <div className="flex flex-col gap-1.5">
                    {label && (
                      <motion.label
                        className="text-base font-medium cursor-pointer disabled:cursor-not-allowed"
                        style={{
                          color: disabled
                            ? `${theme.textColor}50`
                            : theme.textColor,
                        }}
                        onClick={!disabled ? handleClick : undefined}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {label}
                      </motion.label>
                    )}
                    {description && (
                      <motion.p
                        className="text-base"
                        style={{
                          color: disabled
                            ? `${theme.textDimmed}50`
                            : theme.textDimmed,
                        }}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        {description}
                      </motion.p>
                    )}
                  </div>
                )}
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

Checkbox.displayName = "Checkbox";

export { Checkbox };