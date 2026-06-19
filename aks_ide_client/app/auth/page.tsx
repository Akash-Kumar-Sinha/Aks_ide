"use client";

import { motion } from "motion/react";
import { Logo } from "@/components/Logo/Logo";
import { RadialSeparator } from "@/components/ui/radial-separator";
import { SlideButton } from "@/components/ui/slide-button";
import { ScrambleText } from "@/components/ui/scramble-text";
import { TextureBg } from "@/components/ui/texture-bg";

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function AuthPage() {
  return (
    <TextureBg
      className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,#0d1117_0%,#060810_55%,#000000_100%)]"
      blendMode="screen"
      opacity={0.15}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/8 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-90"
        >
          <div
            className="w-full rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(160deg, #131318 0%, #0c0c10 50%, #080809 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px rgba(255,255,255,0.05), 0 24px 64px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.6)",
            }}
          >
            <div className="h-px w-full bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="p-8 space-y-7">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.45 }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-14 h-14 bg-blue-500/15 blur-xl rounded-full" />
                  <Logo className="relative w-9 h-9 text-primary" />
                </div>

                <div className="space-y-1.5">
                  <ScrambleText
                    text="AKS IDE"
                    className="text-xl font-bold text-white tracking-[0.2em]"
                  />
                  <p className="text-xs text-white/35 tracking-[0.15em] uppercase">
                    Cloud Workspace
                  </p>
                </div>
              </motion.div>

              <RadialSeparator className="opacity-50" />

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="space-y-4"
              >
                <p className="text-[10px] text-white/30 text-center tracking-[0.18em] uppercase">
                  Sign in to continue
                </p>

                <a
                  href={`${AUTH_SERVICE_URL}/api/v1/auth/oauth/google/login`}
                  className="block w-full"
                >
                  <SlideButton
                    design="obsidian"
                    className="w-full justify-center px-6 py-3 text-[11px]"
                  >
                    <span className="flex items-center gap-3">
                      <GoogleIcon />
                      Continue with Google
                    </span>
                  </SlideButton>
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-[10px] text-white/18 text-center tracking-wider"
              >
                No password required
              </motion.p>
            </div>

            <div className="h-px w-full bg-linear-to-r from-transparent via-white/4 to-transparent" />
          </div>
        </motion.div>
      </div>
    </TextureBg>
  );
}
