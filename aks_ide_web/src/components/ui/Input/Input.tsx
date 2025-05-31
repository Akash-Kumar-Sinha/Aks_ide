import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTheme from "../lib/useTheme";
import { AlertTriangle, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { cn } from "../lib/utils";
import type {
  DesignVariantType,
  SpaceVariantType,
} from "../Variant/variantType";

type ValidationResult = {
  isValid: boolean;
  message?: string;
} | null;

type InputProps = Omit<React.ComponentProps<typeof motion.input>, "ref"> & {
  onInputChange?: (value: string, isValid: boolean) => void;
  validationResult?: ValidationResult;
  enableValidation?: boolean;
  Icon?: React.ElementType;
  isLoading?: boolean;
  label?: string;
  helpText?: string;
  scale?: SpaceVariantType;
  value?: string | number | readonly string[];
  variant?: DesignVariantType;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      onInputChange,
      validationResult,
      enableValidation = true,
      Icon,
      isLoading = false,
      label,
      helpText,
      scale = "lg",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(
      props.value !== undefined ? props.value.toString() : ""
    );
    const [showPassword, setShowPassword] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
      if (props.value !== undefined && props.value.toString() !== value) {
        setValue(props.value.toString());
      }
    }, [props.value, value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setValue(inputValue);
      props.onChange?.(e);
      setHasInteracted(true);

      if (enableValidation) {
        onInputChange?.(inputValue, validationResult?.isValid ?? true);
      } else {
        onInputChange?.(inputValue, true);
      }
    };

    const showValidation =
      enableValidation && validationResult !== null && hasInteracted;
    const inputType =
      type === "password" ? (showPassword ? "text" : "password") : type;

    // Render based on design variant
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <div className="w-full">
                {label && (
                  <motion.label
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-xs font-medium mb-1"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.label>
                )}

                <div className="relative w-full">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {/* Focus/Error/Success indicators */}
                    {isFocused && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-md"
                        style={{
                          border: `1px solid ${theme.primaryColor}`,
                          boxShadow: `0 0 0 2px ${theme.primaryColor}20`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    {showValidation && validationResult?.isValid === false && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-md"
                        style={{
                          border: `1px solid ${theme.errorColor}70`,
                          boxShadow: `0 0 0 2px ${theme.errorColor}20`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    {showValidation && validationResult?.isValid === true && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-md"
                        style={{
                          border: `1px solid ${theme.successColor}70`,
                          boxShadow: `0 0 0 2px ${theme.successColor}20`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    <div className="relative overflow-hidden rounded-md">
                      {/* Left Icon */}
                      <AnimatePresence mode="wait">
                        {Icon && !isLoading && (
                          <motion.div
                            key="icon"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10"
                            style={{
                              color: isFocused
                                ? theme.primaryColor
                                : theme.textDimmed,
                            }}
                            initial={{ opacity: 0, x: -3 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon size={14} strokeWidth={1.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.input
                        ref={ref}
                        type={inputType}
                        value={value}
                        onFocus={() => {
                          setIsFocused(true);
                          setHasInteracted(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleChange}
                        className={cn(
                          "w-full py-1.5 px-2 text-xs rounded-md outline-none transition-all duration-200",
                          Icon && "pl-7",
                          type === "password" && "pr-7",
                          isLoading && "text-opacity-70",
                          className
                        )}
                        style={{
                          backgroundColor: theme.backgroundColor,
                          color: theme.textColor,
                          border: `1px solid ${theme.secondaryColor}${
                            isFocused ? "70" : "40"
                          }`,
                          boxShadow: `0 1px 2px ${theme.secondaryShade}40`,
                          caretColor: theme.primaryColor,
                          ...(props.disabled || isLoading
                            ? {
                                opacity: isLoading ? 0.8 : 0.6,
                                cursor: "not-allowed",
                                backgroundColor: `${theme.secondaryColor}10`,
                              }
                            : {}),
                        }}
                        placeholder={props.placeholder}
                        disabled={props.disabled || isLoading}
                        {...props}
                      />

                      {/* Right side icons */}
                      <AnimatePresence>
                        {((showValidation &&
                          validationResult?.isValid !== undefined &&
                          !isLoading) ||
                          (type === "password" && !isLoading)) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1"
                          >
                            {type === "password" && (
                              <motion.div
                                onClick={() => setShowPassword(!showPassword)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                  color: isFocused
                                    ? theme.primaryColor
                                    : theme.textDimmed,
                                  cursor: "pointer",
                                }}
                                className="flex items-center justify-center"
                              >
                                {showPassword ? (
                                  <EyeOff size={14} />
                                ) : (
                                  <Eye size={14} />
                                )}
                              </motion.div>
                            )}

                            {showValidation &&
                              validationResult?.isValid === false && (
                                <AlertTriangle
                                  color={theme.errorColor}
                                  size={14}
                                />
                              )}

                            {showValidation &&
                              validationResult?.isValid === true && (
                                <Check color={theme.successColor} size={14} />
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading */}

                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-md">
                          <motion.div
                            className="absolute inset-0 bg-opacity-5 rounded-md"
                            style={{
                              backgroundColor: `${theme.backgroundColor}90`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "linear",
                            }}
                          >
                            <Loader2
                              size={16}
                              className="spinner"
                              color={theme.primaryColor}
                            />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Validation message */}
                  <AnimatePresence>
                    {showValidation &&
                      validationResult?.message &&
                      !validationResult.isValid && (
                        <motion.div
                          initial={{ opacity: 0, y: -3, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -3, height: 0 }}
                          className="text-xs mt-0.5 pl-1 font-medium"
                          style={{ color: theme.errorColor }}
                        >
                          {validationResult.message}
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Help text */}
                  {helpText && !showValidation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      className="text-xs mt-0.5 pl-1"
                      style={{ color: theme.textDimmed }}
                    >
                      {helpText}
                    </motion.div>
                  )}
                </div>
              </div>
            );

          case "lg":
            return (
              <div className="w-full">
                {label && (
                  <motion.label
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.label>
                )}

                <div className="relative w-full">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {/* Focus/Error/Success indicators */}
                    {isFocused && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-lg"
                        style={{
                          border: `1px solid ${theme.primaryColor}`,
                          boxShadow: `0 0 0 3px ${theme.primaryColor}20, 0 2px 4px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    {showValidation && validationResult?.isValid === false && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-lg"
                        style={{
                          border: `1px solid ${theme.errorColor}70`,
                          boxShadow: `0 0 0 3px ${theme.errorColor}20, 0 2px 4px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    {showValidation && validationResult?.isValid === true && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-lg"
                        style={{
                          border: `1px solid ${theme.successColor}70`,
                          boxShadow: `0 0 0 3px ${theme.successColor}20, 0 2px 4px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    <div className="relative overflow-hidden rounded-lg">
                      {/* Left Icon */}
                      <AnimatePresence mode="wait">
                        {Icon && !isLoading && (
                          <motion.div
                            key="icon"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10"
                            style={{
                              color: isFocused
                                ? theme.primaryColor
                                : theme.textDimmed,
                            }}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon size={18} strokeWidth={1.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.input
                        ref={ref}
                        type={inputType}
                        value={value}
                        onFocus={() => {
                          setIsFocused(true);
                          setHasInteracted(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleChange}
                        className={cn(
                          "w-full py-3 px-4 text-sm rounded-lg outline-none transition-all duration-200",
                          Icon && "pl-11",
                          type === "password" && "pr-11",
                          isLoading && "text-opacity-70",
                          className
                        )}
                        style={{
                          backgroundColor: theme.backgroundColor,
                          color: theme.textColor,
                          border: `1px solid ${theme.secondaryColor}${
                            isFocused ? "70" : "40"
                          }`,
                          boxShadow: `0 1px 2px ${theme.secondaryShade}40`,
                          caretColor: theme.primaryColor,
                          ...(props.disabled || isLoading
                            ? {
                                opacity: isLoading ? 0.8 : 0.6,
                                cursor: "not-allowed",
                                backgroundColor: `${theme.secondaryColor}10`,
                              }
                            : {}),
                        }}
                        placeholder={props.placeholder}
                        disabled={props.disabled || isLoading}
                        {...props}
                      />

                      {/* Right side icons */}
                      <AnimatePresence>
                        {((showValidation &&
                          validationResult?.isValid !== undefined &&
                          !isLoading) ||
                          (type === "password" && !isLoading)) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2"
                          >
                            {type === "password" && (
                              <motion.div
                                onClick={() => setShowPassword(!showPassword)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                  color: isFocused
                                    ? theme.primaryColor
                                    : theme.textDimmed,
                                  cursor: "pointer",
                                }}
                                className="flex items-center justify-center"
                              >
                                {showPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </motion.div>
                            )}

                            {showValidation &&
                              validationResult?.isValid === false && (
                                <AlertTriangle
                                  color={theme.errorColor}
                                  size={18}
                                />
                              )}

                            {showValidation &&
                              validationResult?.isValid === true && (
                                <Check color={theme.successColor} size={18} />
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading */}
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                          <motion.div
                            className="absolute inset-0 bg-opacity-5 rounded-lg"
                            style={{
                              backgroundColor: `${theme.backgroundColor}90`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "linear",
                            }}
                          >
                            <Loader2 size={20} color={theme.primaryColor} />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Validation message */}
                  <AnimatePresence>
                    {showValidation &&
                      validationResult?.message &&
                      !validationResult.isValid && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-sm mt-1.5 pl-1 font-medium"
                          style={{ color: theme.errorColor }}
                        >
                          {validationResult.message}
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Help text */}
                  {helpText && !showValidation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      className="text-sm mt-1.5 pl-1"
                      style={{ color: theme.textDimmed }}
                    >
                      {helpText}
                    </motion.div>
                  )}
                </div>
              </div>
            );

          case "xl":
            return (
              <div className="w-full">
                {label && (
                  <motion.label
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-base font-medium mb-3"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.label>
                )}

                <div className="relative w-full">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {/* Focus/Error/Success indicators */}
                    {isFocused && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        style={{
                          border: `2px solid ${theme.primaryColor}`,
                          boxShadow: `0 0 0 4px ${theme.primaryColor}20, 0 4px 6px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    {showValidation && validationResult?.isValid === false && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        style={{
                          border: `2px solid ${theme.errorColor}70`,
                          boxShadow: `0 0 0 4px ${theme.errorColor}20, 0 4px 6px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    {showValidation && validationResult?.isValid === true && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none rounded-xl"
                        style={{
                          border: `2px solid ${theme.successColor}70`,
                          boxShadow: `0 0 0 4px ${theme.successColor}20, 0 4px 6px ${theme.secondaryShade}30`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}

                    <div className="relative overflow-hidden rounded-xl">
                      {/* Left Icon */}
                      <AnimatePresence mode="wait">
                        {Icon && !isLoading && (
                          <motion.div
                            key="icon"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
                            style={{
                              color: isFocused
                                ? theme.primaryColor
                                : theme.textDimmed,
                            }}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon size={22} strokeWidth={1.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.input
                        ref={ref}
                        type={inputType}
                        value={value}
                        onFocus={() => {
                          setIsFocused(true);
                          setHasInteracted(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleChange}
                        className={cn(
                          "w-full py-4 px-5 text-base rounded-xl outline-none transition-all duration-200",
                          Icon && "pl-12",
                          type === "password" && "pr-12",
                          isLoading && "text-opacity-70",
                          className
                        )}
                        style={{
                          backgroundColor: theme.backgroundColor,
                          color: theme.textColor,
                          border: `2px solid ${theme.secondaryColor}${
                            isFocused ? "70" : "40"
                          }`,
                          boxShadow: `0 2px 4px ${theme.secondaryShade}40`,
                          caretColor: theme.primaryColor,
                          ...(props.disabled || isLoading
                            ? {
                                opacity: isLoading ? 0.8 : 0.6,
                                cursor: "not-allowed",
                                backgroundColor: `${theme.secondaryColor}10`,
                              }
                            : {}),
                        }}
                        placeholder={props.placeholder}
                        disabled={props.disabled || isLoading}
                        {...props}
                      />

                      {/* Right side icons */}
                      <AnimatePresence>
                        {((showValidation &&
                          validationResult?.isValid !== undefined &&
                          !isLoading) ||
                          (type === "password" && !isLoading)) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-3"
                          >
                            {type === "password" && (
                              <motion.div
                                onClick={() => setShowPassword(!showPassword)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                  color: isFocused
                                    ? theme.primaryColor
                                    : theme.textDimmed,
                                  cursor: "pointer",
                                }}
                                className="flex items-center justify-center"
                              >
                                {showPassword ? (
                                  <EyeOff size={22} />
                                ) : (
                                  <Eye size={22} />
                                )}
                              </motion.div>
                            )}

                            {showValidation &&
                              validationResult?.isValid === false && (
                                <AlertTriangle
                                  color={theme.errorColor}
                                  size={22}
                                />
                              )}

                            {showValidation &&
                              validationResult?.isValid === true && (
                                <Check color={theme.successColor} size={22} />
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading */}
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                          <motion.div
                            className="absolute inset-0 bg-opacity-5 rounded-xl"
                            style={{
                              backgroundColor: `${theme.backgroundColor}90`,
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "linear",
                            }}
                          >
                            <Loader2 size={24} color={theme.primaryColor} />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Validation message */}
                  <AnimatePresence>
                    {showValidation &&
                      validationResult?.message &&
                      !validationResult.isValid && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          className="text-base mt-2 pl-2 font-medium"
                          style={{ color: theme.errorColor }}
                        >
                          {validationResult.message}
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Help text */}
                  {helpText && !showValidation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.8 }}
                      className="text-base mt-2 pl-2"
                      style={{ color: theme.textDimmed }}
                    >
                      {helpText}
                    </motion.div>
                  )}
                </div>
              </div>
            );

          default:
            return null;
        }

      case "minimal":
        switch (scale) {
          case "sm":
            return (
              <div className="w-full space-y-1">
                {label && (
                  <motion.label
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.label>
                )}

                <div className="relative">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="relative flex items-center">
                      {/* Left Icon */}
                      <AnimatePresence mode="wait">
                        {Icon && !isLoading && (
                          <motion.div
                            key="icon"
                            className="absolute left-2 z-10 flex items-center justify-center"
                            style={{
                              color: isFocused
                                ? theme.primaryColor
                                : theme.textDimmed,
                            }}
                            initial={{ opacity: 0, x: -3 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -3 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon size={14} strokeWidth={1.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.input
                        ref={ref}
                        type={inputType}
                        value={value}
                        onFocus={() => {
                          setIsFocused(true);
                          setHasInteracted(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleChange}
                        className={cn(
                          "flex h-8 w-full border-b bg-transparent px-2 py-1.5 text-xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                          Icon && "pl-7",
                          (type === "password" || showValidation) && "pr-7",
                          showValidation &&
                            validationResult?.isValid === false &&
                            "border-destructive",
                          showValidation &&
                            validationResult?.isValid === true &&
                            "border-success",
                          className
                        )}
                        style={{
                          color: theme.textColor,
                          borderBottomColor:
                            showValidation &&
                            validationResult?.isValid === false
                              ? theme.errorColor
                              : showValidation &&
                                validationResult?.isValid === true
                              ? theme.successColor
                              : isFocused
                              ? theme.primaryColor
                              : `${theme.secondaryColor}40`,
                          caretColor: theme.primaryColor,
                          backgroundColor: "transparent",
                        }}
                        placeholder={props.placeholder}
                        disabled={props.disabled || isLoading}
                        {...props}
                      />

                      {/* Right side indicators */}
                      <AnimatePresence>
                        {((showValidation &&
                          validationResult?.isValid !== undefined &&
                          !isLoading) ||
                          (type === "password" && !isLoading)) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-2 flex items-center gap-1"
                          >
                            {type === "password" && (
                              <motion.button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center rounded-sm p-0.5 hover:bg-accent hover:text-accent-foreground"
                                style={{
                                  color: isFocused
                                    ? theme.primaryColor
                                    : theme.textDimmed,
                                }}
                              >
                                {showPassword ? (
                                  <EyeOff size={14} />
                                ) : (
                                  <Eye size={14} />
                                )}
                              </motion.button>
                            )}

                            {showValidation &&
                              validationResult?.isValid === false && (
                                <AlertTriangle
                                  size={14}
                                  style={{ color: theme.errorColor }}
                                />
                              )}

                            {showValidation &&
                              validationResult?.isValid === true && (
                                <Check
                                  size={14}
                                  style={{ color: theme.successColor }}
                                />
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading spinner */}
                      {isLoading && (
                        <div className="absolute right-2 flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "linear",
                            }}
                          >
                            <Loader2
                              size={14}
                              style={{ color: theme.primaryColor }}
                            />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Validation message */}
                  <AnimatePresence>
                    {showValidation &&
                      validationResult?.message &&
                      !validationResult.isValid && (
                        <motion.div
                          initial={{ opacity: 0, y: -3, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -3, height: 0 }}
                          className="text-xs font-medium mt-1"
                          style={{ color: theme.errorColor }}
                        >
                          {validationResult.message}
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Help text */}
                  {helpText && !showValidation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs mt-1"
                      style={{ color: theme.textDimmed }}
                    >
                      {helpText}
                    </motion.div>
                  )}
                </div>
              </div>
            );

          case "lg":
            return (
              <div className="w-full space-y-2">
                {label && (
                  <motion.label
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.label>
                )}

                <div className="relative">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="relative flex items-center">
                      {/* Left Icon */}
                      <AnimatePresence mode="wait">
                        {Icon && !isLoading && (
                          <motion.div
                            key="icon"
                            className="absolute left-3 z-10 flex items-center justify-center"
                            style={{
                              color: isFocused
                                ? theme.primaryColor
                                : theme.textDimmed,
                            }}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon size={18} strokeWidth={1.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.input
                        ref={ref}
                        type={inputType}
                        value={value}
                        onFocus={() => {
                          setIsFocused(true);
                          setHasInteracted(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleChange}
                        className={cn(
                          "flex h-10 w-full border-b bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                          Icon && "pl-10",
                          (type === "password" || showValidation) && "pr-10",
                          showValidation &&
                            validationResult?.isValid === false &&
                            "border-destructive",
                          showValidation &&
                            validationResult?.isValid === true &&
                            "border-success",
                          className
                        )}
                        style={{
                          color: theme.textColor,
                          borderBottomColor:
                            showValidation &&
                            validationResult?.isValid === false
                              ? theme.errorColor
                              : showValidation &&
                                validationResult?.isValid === true
                              ? theme.successColor
                              : isFocused
                              ? theme.primaryColor
                              : `${theme.secondaryColor}40`,
                          caretColor: theme.primaryColor,
                          backgroundColor: "transparent",
                        }}
                        placeholder={props.placeholder}
                        disabled={props.disabled || isLoading}
                        {...props}
                      />

                      {/* Right side indicators */}
                      <AnimatePresence>
                        {((showValidation &&
                          validationResult?.isValid !== undefined &&
                          !isLoading) ||
                          (type === "password" && !isLoading)) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-3 flex items-center gap-2"
                          >
                            {type === "password" && (
                              <motion.button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center rounded-md p-1 hover:bg-accent hover:text-accent-foreground"
                                style={{
                                  color: isFocused
                                    ? theme.primaryColor
                                    : theme.textDimmed,
                                }}
                              >
                                {showPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </motion.button>
                            )}

                            {showValidation &&
                              validationResult?.isValid === false && (
                                <AlertTriangle
                                  size={18}
                                  style={{ color: theme.errorColor }}
                                />
                              )}

                            {showValidation &&
                              validationResult?.isValid === true && (
                                <Check
                                  size={18}
                                  style={{ color: theme.successColor }}
                                />
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading spinner */}
                      {isLoading && (
                        <div className="absolute right-3 flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "linear",
                            }}
                          >
                            <Loader2
                              size={18}
                              style={{ color: theme.primaryColor }}
                            />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Validation message */}
                  <AnimatePresence>
                    {showValidation &&
                      validationResult?.message &&
                      !validationResult.isValid && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -5, height: 0 }}
                          className="text-sm font-medium mt-1.5"
                          style={{ color: theme.errorColor }}
                        >
                          {validationResult.message}
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Help text */}
                  {helpText && !showValidation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm mt-1.5"
                      style={{ color: theme.textDimmed }}
                    >
                      {helpText}
                    </motion.div>
                  )}
                </div>
              </div>
            );

          case "xl":
            return (
              <div className="w-full space-y-3">
                {label && (
                  <motion.label
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="block text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.label>
                )}

                <div className="relative">
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="relative flex items-center">
                      {/* Left Icon */}
                      <AnimatePresence mode="wait">
                        {Icon && !isLoading && (
                          <motion.div
                            key="icon"
                            className="absolute left-4 z-10 flex items-center justify-center"
                            style={{
                              color: isFocused
                                ? theme.primaryColor
                                : theme.textDimmed,
                            }}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Icon size={22} strokeWidth={1.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.input
                        ref={ref}
                        type={inputType}
                        value={value}
                        onFocus={() => {
                          setIsFocused(true);
                          setHasInteracted(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleChange}
                        className={cn(
                          "flex h-12 w-full border-b-2 bg-transparent px-4 py-3 text-base transition-colors file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                          Icon && "pl-12",
                          (type === "password" || showValidation) && "pr-12",
                          showValidation &&
                            validationResult?.isValid === false &&
                            "border-destructive",
                          showValidation &&
                            validationResult?.isValid === true &&
                            "border-success",
                          className
                        )}
                        style={{
                          color: theme.textColor,
                          borderBottomColor:
                            showValidation &&
                            validationResult?.isValid === false
                              ? theme.errorColor
                              : showValidation &&
                                validationResult?.isValid === true
                              ? theme.successColor
                              : isFocused
                              ? theme.primaryColor
                              : `${theme.secondaryColor}40`,
                          caretColor: theme.primaryColor,
                          backgroundColor: "transparent",
                        }}
                        placeholder={props.placeholder}
                        disabled={props.disabled || isLoading}
                        {...props}
                      />

                      {/* Right side indicators */}
                      <AnimatePresence>
                        {((showValidation &&
                          validationResult?.isValid !== undefined &&
                          !isLoading) ||
                          (type === "password" && !isLoading)) && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute right-4 flex items-center gap-3"
                          >
                            {type === "password" && (
                              <motion.button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center rounded-md p-1.5 hover:bg-accent hover:text-accent-foreground"
                                style={{
                                  color: isFocused
                                    ? theme.primaryColor
                                    : theme.textDimmed,
                                }}
                              >
                                {showPassword ? (
                                  <EyeOff size={22} />
                                ) : (
                                  <Eye size={22} />
                                )}
                              </motion.button>
                            )}

                            {showValidation &&
                              validationResult?.isValid === false && (
                                <AlertTriangle
                                  size={22}
                                  style={{ color: theme.errorColor }}
                                />
                              )}

                            {showValidation &&
                              validationResult?.isValid === true && (
                                <Check
                                  size={22}
                                  style={{ color: theme.successColor }}
                                />
                              )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Loading spinner */}
                      {isLoading && (
                        <div className="absolute right-4 flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: "linear",
                            }}
                          >
                            <Loader2
                              size={22}
                              style={{ color: theme.primaryColor }}
                            />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Validation message */}
                  <AnimatePresence>
                    {showValidation &&
                      validationResult?.message &&
                      !validationResult.isValid && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          className="text-base font-medium mt-2"
                          style={{ color: theme.errorColor }}
                        >
                          {validationResult.message}
                        </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Help text */}
                  {helpText && !showValidation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-base mt-2"
                      style={{ color: theme.textDimmed }}
                    >
                      {helpText}
                    </motion.div>
                  )}
                </div>
              </div>
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }
);

Input.displayName = "Input";

export { Input };
