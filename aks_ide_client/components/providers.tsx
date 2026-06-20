"use client";

import { LazyMotion, domAnimation } from "motion/react";
import { ThemeProvider } from "@/hooks/ThemeProvider";
import { UserProfileProvider } from "@/contexts/UserProfileContext";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="aks-ide-theme">
      <UserProfileProvider>
        <TooltipProvider delayDuration={300}>
          <LazyMotion features={domAnimation}>{children}</LazyMotion>
        </TooltipProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
}
