import React, { useState, useRef, forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useTheme from "../lib/useTheme";
import { Check, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import type {
  SpaceVariantType,
  DesignVariantType,
} from "../Variant/variantType";

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

type OtpProps = React.HTMLAttributes<HTMLDivElement> & {
  otpSize?: number;
  onOtpComplete?: (otp: string) => void;
  enableValidation?: boolean;
  validateOtp?: (otp: string) => ValidationResult;
  setValidationResult: (result: ValidationResult | null) => void;
  validationResult: ValidationResult | null;
  autoFocus?: boolean;
  loading?: boolean;
  label?: string;
  helpText?: string;
  variant?: DesignVariantType;
  scale?: SpaceVariantType;
  resendAction?: () => void;
  resendCountdown?: number;
};

const Otp = forwardRef<HTMLDivElement, OtpProps>(
  (
    {
      otpSize = 6,
      onOtpComplete,
      enableValidation = true,
      className,
      validateOtp,
      autoFocus = false,
      validationResult,
      setValidationResult,
      loading = false,
      label,
      helpText,
      variant = "default",
      scale = "lg",
      resendAction,
      resendCountdown = 60,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [otpDigits, setOtpDigits] = useState<string[]>(
      Array(otpSize).fill("")
    );
    const [countdown, setCountdown] = useState(resendCountdown);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>(
      Array(otpSize).fill(null)
    );

    // Focus the first input on mount if autoFocus is true
    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }, [autoFocus]);

    // Handle resend countdown
    useEffect(() => {
      let timer: number;
      if (isCountingDown && countdown > 0) {
        timer = window.setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else if (countdown === 0) {
        setIsCountingDown(false);
      }

      return () => {
        if (timer) window.clearInterval(timer);
      };
    }, [isCountingDown, countdown]);

    const handleResendAction = () => {
      if (resendAction && !isCountingDown) {
        resendAction();
        setCountdown(resendCountdown);
        setIsCountingDown(true);
      }
    };

    const handleInputChange = (index: number, value: string) => {
      // Only allow numeric inputs
      if (value && !/^\d+$/.test(value)) return;

      // Update digits
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = value;
      setOtpDigits(newOtpDigits);

      // Auto focus to next input
      if (value && index < otpSize - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Check if OTP is complete
      const fullOtp = newOtpDigits.join("");

      if (fullOtp.length === otpSize) {
        if (validateOtp && enableValidation) {
          const result = validateOtp(fullOtp);
          setValidationResult(result);

          if (result.isValid) {
            onOtpComplete?.(fullOtp);
          }
        } else {
          setValidationResult(null);
          onOtpComplete?.(fullOtp);
        }
      } else {
        setValidationResult(null);
      }
    };

    const handleKeyDown = (
      index: number,
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      // Handle backspace to move to previous input
      if (event.key === "Backspace") {
        if (otpDigits[index]) {
          // If current input has a value, just clear it
          const newOtpDigits = [...otpDigits];
          newOtpDigits[index] = "";
          setOtpDigits(newOtpDigits);
        } else if (index > 0) {
          // If current input is empty, move to previous
          inputRefs.current[index - 1]?.focus();
        }
      }

      // Handle left arrow key
      if (event.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      // Handle right arrow key
      if (event.key === "ArrowRight" && index < otpSize - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (event: React.ClipboardEvent) => {
      event.preventDefault();
      const pastedData = event.clipboardData.getData("text");

      // Filter only numeric characters
      const pastedNumbers = pastedData.replace(/\D/g, "");

      // Fill in as many digits as we can
      const newOtpDigits = [...otpDigits];

      for (let i = 0; i < Math.min(pastedNumbers.length, otpSize); i++) {
        newOtpDigits[i] = pastedNumbers[i];
      }

      setOtpDigits(newOtpDigits);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtpDigits.findIndex((digit) => !digit);
      if (nextEmptyIndex !== -1 && nextEmptyIndex < otpSize) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[otpSize - 1]?.focus();
      }

      // Check if OTP is complete after paste
      const fullOtp = newOtpDigits.join("");
      if (fullOtp.length === otpSize) {
        if (validateOtp && enableValidation) {
          const result = validateOtp(fullOtp);
          setValidationResult(result);

          if (result.isValid) {
            onOtpComplete?.(fullOtp);
          }
        } else {
          onOtpComplete?.(fullOtp);
        }
      }
    };

    // Render based on design variant
    switch (variant) {
      case "default":
        switch (scale) {
          case "sm":
            return (
              <div ref={ref} className={cn("w-full", className)} {...props}>
                {/* Label */}
                {label && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-xs mb-2"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.div>
                )}

                {/* OTP Input Fields */}
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={loading}
                        className="w-8 h-8 text-center text-sm outline-none rounded transition-all duration-200"
                        style={{
                          backgroundColor: loading
                            ? `${theme.secondaryColor}10`
                            : theme.backgroundColor,
                          border: `1px solid ${
                            loading
                              ? `${theme.secondaryColor}20`
                              : validationResult?.isValid === false
                              ? theme.errorColor
                              : validationResult?.isValid === true
                              ? theme.successColor
                              : focusedIndex === index
                              ? theme.primaryColor
                              : `${theme.secondaryColor}60`
                          }`,
                          color: loading
                            ? `${theme.textColor}50`
                            : theme.textColor,
                          boxShadow:
                            focusedIndex === index && !loading
                              ? `0 0 0 2px ${theme.primaryShade}40`
                              : validationResult?.isValid === false
                              ? `0 0 0 2px ${theme.errorColor}40`
                              : validationResult?.isValid === true
                              ? `0 0 0 2px ${theme.successColor}40`
                              : `0 1px 2px ${theme.primaryShade}05`,
                          caretColor: "transparent",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Help Text */}
                {helpText && !validationResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="text-center text-xs mt-2"
                    style={{ color: theme.textDimmed }}
                  >
                    {helpText}
                  </motion.div>
                )}

                {/* Validation Status */}
                <AnimatePresence>
                  {enableValidation && validationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="font-medium text-center text-xs flex items-center justify-center mt-2"
                      style={{
                        color: validationResult.isValid
                          ? theme.successColor
                          : theme.errorColor,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mr-1"
                      >
                        {validationResult.isValid ? (
                          <Check size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                      </motion.div>
                      {validationResult.isValid
                        ? "Verification successful"
                        : validationResult.message ||
                          "Invalid verification code"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resend Action */}
                {resendAction && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-2"
                  >
                    <motion.button
                      type="button"
                      onClick={handleResendAction}
                      disabled={isCountingDown}
                      className="font-medium text-xs flex items-center justify-center mx-auto transition-all duration-200"
                      style={{
                        color: isCountingDown
                          ? theme.textDimmed
                          : theme.accentColor,
                        cursor: isCountingDown ? "default" : "pointer",
                      }}
                      whileHover={!isCountingDown ? { scale: 1.05 } : {}}
                      whileTap={!isCountingDown ? { scale: 0.95 } : {}}
                    >
                      {isCountingDown && (
                        <RefreshCw size={10} className="mr-1 animate-spin" />
                      )}
                      {isCountingDown
                        ? `Resend available in ${countdown}s`
                        : "Resend verification code"}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            );

          case "lg":
            return (
             <div ref={ref} className={cn("w-full", className)} {...props}>
                {/* Label */}
                {label && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-base mb-3"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.div>
                )}

                {/* OTP Input Fields */}
                <div className="flex items-center justify-center gap-3">
                  {otpDigits.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={loading}
                        className="w-12 h-12 text-center text-lg outline-none rounded-md transition-all duration-200"
                        style={{
                          backgroundColor: loading
                            ? `${theme.secondaryColor}10`
                            : theme.backgroundColor,
                          border: `1px solid ${
                            loading
                              ? `${theme.secondaryColor}20`
                              : validationResult?.isValid === false
                              ? theme.errorColor
                              : validationResult?.isValid === true
                              ? theme.successColor
                              : focusedIndex === index
                              ? theme.primaryColor
                              : `${theme.secondaryColor}60`
                          }`,
                          color: loading
                            ? `${theme.textColor}50`
                            : theme.textColor,
                          boxShadow:
                            focusedIndex === index && !loading
                              ? `0 0 0 2px ${theme.primaryShade}40`
                              : validationResult?.isValid === false
                              ? `0 0 0 2px ${theme.errorColor}40`
                              : validationResult?.isValid === true
                              ? `0 0 0 2px ${theme.successColor}40`
                              : `0 1px 2px ${theme.primaryShade}05`,
                          caretColor: "transparent",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Help Text */}
                {helpText && !validationResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="text-center text-sm mt-3"
                    style={{ color: theme.textDimmed }}
                  >
                    {helpText}
                  </motion.div>
                )}

                {/* Validation Status */}
                <AnimatePresence>
                  {enableValidation && validationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="font-medium text-center text-sm flex items-center justify-center mt-3"
                      style={{
                        color: validationResult.isValid
                          ? theme.successColor
                          : theme.errorColor,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mr-2"
                      >
                        {validationResult.isValid ? (
                          <Check size={16} />
                        ) : (
                          <AlertTriangle size={16} />
                        )}
                      </motion.div>
                      {validationResult.isValid
                        ? "Verification successful"
                        : validationResult.message ||
                          "Invalid verification code"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resend Action */}
                {resendAction && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-3"
                  >
                    <motion.button
                      type="button"
                      onClick={handleResendAction}
                      disabled={isCountingDown}
                      className="font-medium text-sm flex items-center justify-center mx-auto transition-all duration-200"
                      style={{
                        color: isCountingDown
                          ? theme.textDimmed
                          : theme.accentColor,
                        cursor: isCountingDown ? "default" : "pointer",
                      }}
                      whileHover={!isCountingDown ? { scale: 1.05 } : {}}
                      whileTap={!isCountingDown ? { scale: 0.95 } : {}}
                    >
                      {isCountingDown && (
                        <RefreshCw size={12} className="mr-2 animate-spin" />
                      )}
                      {isCountingDown
                        ? `Resend available in ${countdown}s`
                        : "Resend verification code"}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            );

          case "xl":
            return (
              <div ref={ref} className={cn("w-full", className)} {...props}>
                {/* Label */}
                {label && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-lg mb-4"
                    style={{ color: theme.textColor }}
                  >
                    {label}
                  </motion.div>
                )}

                {/* OTP Input Fields */}
                <div className="flex items-center justify-center gap-4">
                  {otpDigits.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={loading}
                        className="w-16 h-16 text-center text-xl outline-none rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: loading
                            ? `${theme.secondaryColor}10`
                            : theme.backgroundColor,
                          border: `2px solid ${
                            loading
                              ? `${theme.secondaryColor}20`
                              : validationResult?.isValid === false
                              ? theme.errorColor
                              : validationResult?.isValid === true
                              ? theme.successColor
                              : focusedIndex === index
                              ? theme.primaryColor
                              : `${theme.secondaryColor}60`
                          }`,
                          color: loading
                            ? `${theme.textColor}50`
                            : theme.textColor,
                          boxShadow:
                            focusedIndex === index && !loading
                              ? `0 0 0 3px ${theme.primaryShade}40`
                              : validationResult?.isValid === false
                              ? `0 0 0 3px ${theme.errorColor}40`
                              : validationResult?.isValid === true
                              ? `0 0 0 3px ${theme.successColor}40`
                              : `0 2px 4px ${theme.primaryShade}05`,
                          caretColor: "transparent",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Help Text */}
                {helpText && !validationResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="text-center text-base mt-4"
                    style={{ color: theme.textDimmed }}
                  >
                    {helpText}
                  </motion.div>
                )}

                {/* Validation Status */}
                <AnimatePresence>
                  {enableValidation && validationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="font-medium text-center text-base flex items-center justify-center mt-4"
                      style={{
                        color: validationResult.isValid
                          ? theme.successColor
                          : theme.errorColor,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mr-2"
                      >
                        {validationResult.isValid ? (
                          <Check size={20} />
                        ) : (
                          <AlertTriangle size={20} />
                        )}
                      </motion.div>
                      {validationResult.isValid
                        ? "Verification successful"
                        : validationResult.message ||
                          "Invalid verification code"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resend Action */}
                {resendAction && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-4"
                  >
                    <motion.button
                      type="button"
                      onClick={handleResendAction}
                      disabled={isCountingDown}
                      className="font-medium text-base flex items-center justify-center mx-auto transition-all duration-200"
                      style={{
                        color: isCountingDown
                          ? theme.textDimmed
                          : theme.accentColor,
                        cursor: isCountingDown ? "default" : "pointer",
                      }}
                      whileHover={!isCountingDown ? { scale: 1.05 } : {}}
                      whileTap={!isCountingDown ? { scale: 0.95 } : {}}
                    >
                      {isCountingDown && (
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                      )}
                      {isCountingDown
                        ? `Resend available in ${countdown}s`
                        : "Resend verification code"}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            );

          default:
            return null;
        }

      case "minimal":
        switch (scale) {
          case "sm":
            return (
              <div ref={ref} className={cn("w-full", className)} {...props}>
                {/* Label */}
                {label && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-xs mb-2"
                    style={{ color: theme.textDimmed }}
                  >
                    {label}
                  </motion.div>
                )}

                {/* OTP Input Fields */}
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={loading}
                        className="w-8 h-8 text-center text-sm outline-none border-t-0 border-l-0 border-r-0 rounded-none transition-all duration-200"
                        style={{
                          backgroundColor: "transparent",
                          borderBottomWidth: "1px",
                          borderBottomColor: loading
                            ? `${theme.textColor}15`
                            : validationResult?.isValid === false
                            ? theme.errorColor
                            : validationResult?.isValid === true
                            ? theme.successColor
                            : focusedIndex === index
                            ? theme.textColor
                            : `${theme.textDimmed}30`,
                          color: loading
                            ? `${theme.textColor}50`
                            : theme.textColor,
                          boxShadow:
                            focusedIndex === index && !loading
                              ? `0 1px 0 ${theme.textColor}`
                              : validationResult?.isValid === false
                              ? `0 1px 0 ${theme.errorColor}`
                              : validationResult?.isValid === true
                              ? `0 1px 0 ${theme.successColor}`
                              : "none",
                          caretColor: "transparent",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Help Text */}
                {helpText && !validationResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="text-center text-xs mt-2"
                    style={{ color: `${theme.textDimmed}80` }}
                  >
                    {helpText}
                  </motion.div>
                )}

                {/* Validation Status */}
                <AnimatePresence>
                  {enableValidation && validationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="font-medium text-center text-xs flex items-center justify-center mt-2"
                      style={{
                        color: validationResult.isValid
                          ? theme.successColor
                          : theme.errorColor,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mr-1"
                      >
                        {validationResult.isValid ? (
                          <Check size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                      </motion.div>
                      {validationResult.isValid
                        ? "Verification successful"
                        : validationResult.message ||
                          "Invalid verification code"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resend Action */}
                {resendAction && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-2"
                  >
                    <motion.button
                      type="button"
                      onClick={handleResendAction}
                      disabled={isCountingDown}
                      className="font-medium text-xs flex items-center justify-center mx-auto transition-all duration-200"
                      style={{
                        color: isCountingDown
                          ? theme.textDimmed
                          : theme.accentColor,
                        cursor: isCountingDown ? "default" : "pointer",
                      }}
                      whileHover={!isCountingDown ? { scale: 1.05 } : {}}
                      whileTap={!isCountingDown ? { scale: 0.95 } : {}}
                    >
                      {isCountingDown && (
                        <RefreshCw size={10} className="mr-1 animate-spin" />
                      )}
                      {isCountingDown
                        ? `Resend available in ${countdown}s`
                        : "Resend verification code"}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            );

          case "lg":
            return (
              <div ref={ref} className={cn("w-full", className)} {...props}>
                {/* Label */}
                {label && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-sm mb-3"
                    style={{ color: theme.textDimmed }}
                  >
                    {label}
                  </motion.div>
                )}

                {/* OTP Input Fields */}
                <div className="flex items-center justify-center gap-3">
                  {otpDigits.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={loading}
                        className="w-10 h-10 text-center text-base outline-none border-t-0 border-l-0 border-r-0 rounded-none transition-all duration-200"
                        style={{
                          backgroundColor: "transparent",
                          borderBottomWidth: "2px",
                          borderBottomColor: loading
                            ? `${theme.textColor}15`
                            : validationResult?.isValid === false
                            ? theme.errorColor
                            : validationResult?.isValid === true
                            ? theme.successColor
                            : focusedIndex === index
                            ? theme.textColor
                            : `${theme.textDimmed}40`,
                          color: loading
                            ? `${theme.textColor}50`
                            : theme.textColor,
                          boxShadow:
                            focusedIndex === index && !loading
                              ? `0 2px 0 ${theme.textColor}`
                              : validationResult?.isValid === false
                              ? `0 2px 0 ${theme.errorColor}`
                              : validationResult?.isValid === true
                              ? `0 2px 0 ${theme.successColor}`
                              : "none",
                          caretColor: "transparent",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Help Text */}
                {helpText && !validationResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="text-center text-sm mt-3"
                    style={{ color: `${theme.textDimmed}80` }}
                  >
                    {helpText}
                  </motion.div>
                )}

                {/* Validation Status */}
                <AnimatePresence>
                  {enableValidation && validationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="font-medium text-center text-sm flex items-center justify-center mt-3"
                      style={{
                        color: validationResult.isValid
                          ? theme.successColor
                          : theme.errorColor,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mr-2"
                      >
                        {validationResult.isValid ? (
                          <Check size={14} />
                        ) : (
                          <AlertTriangle size={14} />
                        )}
                      </motion.div>
                      {validationResult.isValid
                        ? "Verification successful"
                        : validationResult.message ||
                          "Invalid verification code"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resend Action */}
                {resendAction && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-3"
                  >
                    <motion.button
                      type="button"
                      onClick={handleResendAction}
                      disabled={isCountingDown}
                      className="font-medium text-sm flex items-center justify-center mx-auto transition-all duration-200"
                      style={{
                        color: isCountingDown
                          ? theme.textDimmed
                          : theme.accentColor,
                        cursor: isCountingDown ? "default" : "pointer",
                      }}
                      whileHover={!isCountingDown ? { scale: 1.05 } : {}}
                      whileTap={!isCountingDown ? { scale: 0.95 } : {}}
                    >
                      {isCountingDown && (
                        <RefreshCw size={12} className="mr-2 animate-spin" />
                      )}
                      {isCountingDown
                        ? `Resend available in ${countdown}s`
                        : "Resend verification code"}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            );

          case "xl":
            return (
              <div ref={ref} className={cn("w-full", className)} {...props}>
              
                {label && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-medium text-base mb-4"
                    style={{ color: theme.textDimmed }}
                  >
                    {label}
                  </motion.div>
                )}

                {/* OTP Input Fields */}
                <div className="flex items-center justify-center gap-4">
                  {otpDigits.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <input
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={loading}
                        className="w-12 h-12 text-center text-lg outline-none border-t-0 border-l-0 border-r-0 rounded-none transition-all duration-200"
                        style={{
                          backgroundColor: "transparent",
                          borderBottomWidth: "2px",
                          borderBottomColor: loading
                            ? `${theme.textColor}15`
                            : validationResult?.isValid === false
                            ? theme.errorColor
                            : validationResult?.isValid === true
                            ? theme.successColor
                            : focusedIndex === index
                            ? theme.textColor
                            : `${theme.textDimmed}40`,
                          color: loading
                            ? `${theme.textColor}50`
                            : theme.textColor,
                          boxShadow:
                            focusedIndex === index && !loading
                              ? `0 2px 0 ${theme.textColor}`
                              : validationResult?.isValid === false
                              ? `0 2px 0 ${theme.errorColor}`
                              : validationResult?.isValid === true
                              ? `0 2px 0 ${theme.successColor}`
                              : "none",
                          caretColor: "transparent",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Help Text */}
                {helpText && !validationResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="text-center text-base mt-4"
                    style={{ color: `${theme.textDimmed}80` }}
                  >
                    {helpText}
                  </motion.div>
                )}

                {/* Validation Status */}
                <AnimatePresence>
                  {enableValidation && validationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="font-medium text-center text-base flex items-center justify-center mt-4"
                      style={{
                        color: validationResult.isValid
                          ? theme.successColor
                          : theme.errorColor,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                        className="mr-2"
                      >
                        {validationResult.isValid ? (
                          <Check size={16} />
                        ) : (
                          <AlertTriangle size={16} />
                        )}
                      </motion.div>
                      {validationResult.isValid
                        ? "Verification successful"
                        : validationResult.message ||
                          "Invalid verification code"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Resend Action */}
                {resendAction && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mt-4"
                  >
                    <motion.button
                      type="button"
                      onClick={handleResendAction}
                      disabled={isCountingDown}
                      className="font-medium text-base flex items-center justify-center mx-auto transition-all duration-200"
                      style={{
                        color: isCountingDown
                          ? theme.textDimmed
                          : theme.accentColor,
                        cursor: isCountingDown ? "default" : "pointer",
                      }}
                      whileHover={!isCountingDown ? { scale: 1.05 } : {}}
                      whileTap={!isCountingDown ? { scale: 0.95 } : {}}
                    >
                      {isCountingDown && (
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                      )}
                      {isCountingDown
                        ? `Resend available in ${countdown}s`
                        : "Resend verification code"}
                    </motion.button>
                  </motion.div>
                )}
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

Otp.displayName = "Otp";

export { Otp };
