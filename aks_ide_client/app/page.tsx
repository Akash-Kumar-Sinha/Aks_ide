"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/Logo/Logo";
import { TextureBg } from "@/components/ui/texture-bg";
import { ScrambleText } from "@/components/ui/scramble-text";
import { SlideButton } from "@/components/ui/slide-button";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { KineticText } from "@/components/ui/kinetic-text";
import { RadialSeparator } from "@/components/ui/radial-separator";

export default function LandingPage() {
  return (
    <TextureBg
      opacity={0.2}
      className="flex flex-col gap-8 min-h-screen items-center justify-center rounded-2xl text-black bg-[radial-gradient(ellipse_at_top,#0d1117_0%,#060810_55%,#000000_100%)]"
    >
      <nav className="fixed top-0 inset-x-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5 text-white" />
            <ScrambleText
              text="IDE"
              className="text-sm font-semibold text-white tracking-widest"
            />
          </div>

          <Link href="/auth">
            <SlideButton
              design="obsidian"
              className="px-4 py-1.5 text-xs sm:px-5 sm:py-2"
            >
              Open IDE
            </SlideButton>
          </Link>
        </div>
      </nav>

      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20 text-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[min(600px,100vw)] h-[300px] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-900 bg-zinc-800"
          >
            <span className="text-xs text-white/50 tracking-widest uppercase">
              Cloud-Native Development
            </span>
          </motion.div>

          <LineShadowText
            as="h1"
            shadowColor="#3b82f6"
            className="text-6xl sm:text-8xl font-bold text-white tracking-tight"
          >
            IDE
          </LineShadowText>
          <KineticText
            text="Code anywhere. Ship everywhere."
            className="text-[3rem] tracking-[-5%] [font-optical-sizing:auto] text-white"
          />

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-sm text-white/40 leading-relaxed max-w-md"
          >
            A fully-functional Linux development environment in your browser.
            Real shell. Real editor. Real containers. No setup required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/auth">
              <SlideButton design="obsidian" className="px-10 py-4 text-sm">
                Get Started
              </SlideButton>
            </Link>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-xs text-white/40 tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-px h-8 bg-linear-to-b from-white/20 to-transparent" />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <RadialSeparator />
      </div>

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto flex flex-col items-center gap-6 text-center">
          <span className="text-xs text-blue-500/70 tracking-widest uppercase">
            Open Beta
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Start coding in seconds.
            <br />
            <span className="text-white/35">No install. No config.</span>
          </h2>
          <p className="text-sm text-white/40 max-w-sm leading-relaxed">
            Sign in with Google and your cloud workspace is ready. A real Linux
            shell, a real editor, in your browser.
          </p>
          <Link href="/auth">
            <SlideButton design="obsidian" className="px-12 py-5 text-sm mt-2">
              Open IDE
            </SlideButton>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-4 h-4 sm:w-4 sm:h-4 text-white/40" />
            <ScrambleText
              text="IDE"
              className="text-xs text-white/40 tracking-widest"
            />
          </div>
          <p className="text-xs text-white/20">
            Built by{" "}
            <a
              href="mailto:aks.krsinha@gmail.com"
              className="text-white/35 hover:text-white/60 transition-colors"
            >
              Akash Kumar Sinha
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-xs text-white/25 hover:text-white/50 transition-colors tracking-widest uppercase"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </TextureBg>
  );
}
