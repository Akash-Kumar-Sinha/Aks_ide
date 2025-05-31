import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export type Theme = {
  backgroundColor: string;
  textColor: string;
  textDimmed: string;
  primaryColor: string;
  primaryShade: string;
  primaryGradient: string;
  secondaryColor: string;
  secondaryShade: string;
  accentColor: string;
  errorColor: string;
  successColor: string;
  warningColor: string;
  infoColor: string;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default useTheme;
