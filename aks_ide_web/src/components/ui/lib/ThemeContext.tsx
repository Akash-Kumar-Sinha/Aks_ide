import { createContext } from "react";
import type { Theme } from "./useTheme";

export const DEFAULT_COLORS = {
  backgroundColor: "#09090b",
  textColor: "#f4f4f5",
  textDimmed: "#a1a1aa",

  primaryColor: "#3b82f6",
  primaryShade: "#2563eb",
  primaryGradient: "linear-gradient(135deg, #3b82f6, #2563eb)",

  secondaryColor: "#22d3ee",
  secondaryShade: "#06b6d4",

  accentColor: "#8b5cf6",
  errorColor: "#ef4444",
  successColor: "#22c55e",
  warningColor: "#f59e0b",
  infoColor: "#38bdf8",
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
