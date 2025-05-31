import React, { useState, type ReactNode } from "react";
import { DEFAULT_COLORS, ThemeContext } from "./ThemeContext";
import type { Theme } from "./useTheme";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(DEFAULT_COLORS);

  const updateBackgroundColor = (color: string) => {
    setTheme((prev) => ({ ...prev, backgroundColor: color }));
  };

  const updateSecondaryColor = (color: string) => {
    setTheme((prev) => ({ ...prev, secondaryColor: color }));
  };

  const updateSecondaryShade = (color: string) => {
    setTheme((prev) => ({ ...prev, secondaryShade: color }));
  };

  const updateTextColor = (color: string) => {
    setTheme((prev) => ({ ...prev, textColor: color }));
  };

  const updateTextDimmed = (color: string) => {
    setTheme((prev) => ({ ...prev, textDimmed: color }));
  };

  const updatePrimaryColor = (color: string) => {
    setTheme((prev) => ({ ...prev, primaryColor: color }));
  };

  const updatePrimaryShade = (color: string) => {
    setTheme((prev) => ({ ...prev, primaryShade: color }));
  };

  const updatePrimaryGradient = (gradient: string) => {
    setTheme((prev) => ({ ...prev, primaryGradient: gradient }));
  };

  const updateAccentColor = (color: string) => {
    setTheme((prev) => ({ ...prev, accentColor: color }));
  };

  const updateErrorColor = (color: string) => {
    setTheme((prev) => ({ ...prev, errorColor: color }));
  };

  const updateSuccessColor = (color: string) => {
    setTheme((prev) => ({ ...prev, successColor: color }));
  };

  const updateWarningColor = (color: string) => {
    setTheme((prev) => ({ ...prev, warningColor: color }));
  };

  const updateInfoColor = (color: string) => {
    setTheme((prev) => ({ ...prev, infoColor: color }));
  };              

  const resetToDefault = () => {
    setTheme(DEFAULT_COLORS);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateBackgroundColor,
        updateSecondaryColor,
        updateSecondaryShade,
        updateTextColor,
        updateTextDimmed,
        updatePrimaryColor,
        updatePrimaryShade,
        updatePrimaryGradient,
        updateAccentColor,
        updateErrorColor,
        updateSuccessColor,
        updateWarningColor,
        updateInfoColor,  
        resetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
