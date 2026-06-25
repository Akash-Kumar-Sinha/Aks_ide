"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Logo } from "@/components/Logo/Logo";
import { TextureBg } from "@/components/ui/texture-bg";
import { SlideButton } from "@/components/ui/slide-button";

gsap.registerPlugin(useGSAP);

export default function Error({ reset }: { reset: () => void }) {
  useGSAP(() => {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".gsap-err-logo",  { opacity: 0, scale: 0.7, duration: 0.5 })
      .from(".gsap-err-title", { opacity: 0, y: 20, duration: 0.5 }, "-=0.2")
      .from(".gsap-err-text",  { opacity: 0, y: 10, duration: 0.4 }, "-=0.2")
      .from(".gsap-err-btn",   { opacity: 0, y: 8,  duration: 0.4 }, "-=0.2");
  });

  return (
    <TextureBg
      opacity={0.15}
      className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,#0d1117_0%,#060810_55%,#000000_100%)]"
    >
      <div className="flex flex-col items-center gap-6 text-center px-6">
        <Logo className="gsap-err-logo w-8 h-8 text-white/30" />
        <div className="flex flex-col gap-2">
          <span className="gsap-err-title text-sm font-semibold text-white/60">Something went wrong</span>
          <p className="gsap-err-text text-xs text-white/30 max-w-xs">
            An unexpected error occurred. Try refreshing or go back to the home page.
          </p>
        </div>
        <SlideButton
          design="obsidian"
          className="gsap-err-btn px-8 py-2.5 text-xs"
          onClick={reset}
        >
          Try again
        </SlideButton>
      </div>
    </TextureBg>
  );
}
