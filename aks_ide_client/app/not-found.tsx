"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Logo } from "@/components/Logo/Logo";
import { TextureBg } from "@/components/ui/texture-bg";
import { SlideButton } from "@/components/ui/slide-button";

gsap.registerPlugin(useGSAP);

export default function NotFound() {
  useGSAP(() => {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".gsap-404-logo",   { opacity: 0, scale: 0.7, duration: 0.5 })
      .from(".gsap-404-number", { opacity: 0, y: 20, duration: 0.5 }, "-=0.2")
      .from(".gsap-404-text",   { opacity: 0, y: 10, duration: 0.4 }, "-=0.2")
      .from(".gsap-404-btn",    { opacity: 0, y: 8,  duration: 0.4 }, "-=0.2");
  });

  return (
    <TextureBg
      opacity={0.15}
      className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,#0d1117_0%,#060810_55%,#000000_100%)]"
    >
      <div className="flex flex-col items-center gap-6 text-center px-6">
        <Logo className="gsap-404-logo w-8 h-8 text-white/30" />
        <div className="flex flex-col gap-2">
          <span className="gsap-404-number text-6xl font-bold text-white/10 tracking-tight">404</span>
          <p className="gsap-404-text text-sm text-white/40">This page doesn&apos;t exist.</p>
        </div>
        <Link href="/" className="gsap-404-btn">
          <SlideButton design="obsidian" className="px-8 py-2.5 text-xs">
            Go Home
          </SlideButton>
        </Link>
      </div>
    </TextureBg>
  );
}
