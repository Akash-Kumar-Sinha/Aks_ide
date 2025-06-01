import { createContext } from "react";
import type { Theme } from "./useTheme";

// export const DEFAULT_COLORS = {
//   backgroundColor: "#0d1117", // GitHub dark
//   textColor: "#c9d1d9", // Muted white
//   textDimmed: "#8b949e", // Subtle gray

//   primaryColor: "#58a6ff", // Blue accent
//   primaryShade: "#1f6feb",
//   primaryGradient: "linear-gradient(135deg, #1f6feb, #58a6ff)",

//   secondaryColor: "#d2a8ff", // Lavender secondary
//   secondaryShade: "#a371f7",

//   accentColor: "#f778ba", // Hot pink for buttons
//   errorColor: "#f85149", // Alert red
//   successColor: "#3fb950", // GitHub green
//   warningColor: "#d29922",
//   infoColor: "#79c0ff",
// };

export const DEFAULT_COLORS = {
  backgroundColor: "#0f1117",       // Deep dark background
  textColor: "#e4e4e7",             // Light neutral for readability
  textDimmed: "#6e6e80",            // Muted for comments or UI hints

  primaryColor: "#3b82f6",          // Bright blue (VSCode feel)
  primaryShade: "#2563eb",
  primaryGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",

  secondaryColor: "#22d3ee",        // Cyan secondary
  secondaryShade: "#0ea5e9",

  accentColor: "#c084fc",           // Soft violet for accent UI
  errorColor: "#ef4444",            // Red for errors
  successColor: "#22c55e",          // Green for success
  warningColor: "#f59e0b",          // Yellow for warnings
  infoColor: "#38bdf8",             // Light blue for info messages
};


// export const DEFAULT_COLORS = {
//   backgroundColor: "#000000",
//   textColor: "#e5e7eb",
//   textDimmed: "#6b7280",

//   primaryColor: "#ec4899",
//   primaryShade: "#db2777",
//   primaryGradient: "linear-gradient(135deg, #ec4899, #db2777)",

//   secondaryColor: "#f97316",
//   secondaryShade: "#ea580c",

//   accentColor: "#8b5cf6",
//   errorColor: "#dc2626",
//   successColor: "#10b981",
//   warningColor: "#facc15",
//   infoColor: "#0ea5e9",
// };

export type ThemeContextType = {
  theme: Theme;
  updateBackgroundColor: (color: string) => void;
  updateSecondaryColor: (color: string) => void;
  updateSecondaryShade: (color: string) => void;
  updateTextColor: (color: string) => void;
  updateTextDimmed: (color: string) => void;
  updatePrimaryColor: (color: string) => void;
  updatePrimaryShade: (color: string) => void;
  updatePrimaryGradient: (gradient: string) => void;
  updateAccentColor: (color: string) => void;
  updateErrorColor: (color: string) => void;
  updateSuccessColor: (color: string) => void;
  updateWarningColor: (color: string) => void;
  updateInfoColor: (color: string) => void;
  resetToDefault: () => void;
};
export const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_COLORS,
  updateBackgroundColor: () => {},
  updateSecondaryColor: () => {},
  updateSecondaryShade: () => {},
  updateTextColor: () => {},
  updateTextDimmed: () => {},
  updatePrimaryColor: () => {},
  updatePrimaryShade: () => {},
  updatePrimaryGradient: () => {},
  updateAccentColor: () => {},
  updateErrorColor: () => {},
  updateSuccessColor: () => {},
  updateWarningColor: () => {},
  updateInfoColor: () => {},
  resetToDefault: () => {},
});
