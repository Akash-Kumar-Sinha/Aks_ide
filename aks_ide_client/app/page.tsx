"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Logo } from "@/components/Logo/Logo";
import { TextureBg } from "@/components/ui/texture-bg";
import { ScrambleText } from "@/components/ui/scramble-text";
import { SlideButton } from "@/components/ui/slide-button";
import { LineShadowText } from "@/components/ui/line-shadow-text";
import { KineticText } from "@/components/ui/kinetic-text";
import { RadialSeparator } from "@/components/ui/radial-separator";
import { Terminal, Code2, Box, Zap } from "lucide-react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const VIDEO_EMBED_URL =
  "https://drive.google.com/file/d/1umfak-f7pN-izMa0U_A9SLjThUpo2eWz/preview";

const FEATURES = [
  {
    icon: Terminal,
    title: "Real Linux Shell",
    body: "A PTY-backed bash session inside an isolated Ubuntu container - install any tool, run any command.",
  },
  {
    icon: Code2,
    title: "Monaco Editor",
    body: "The same engine that powers VS Code. Syntax highlighting, multi-tab, and unsaved-change indicators.",
  },
  {
    icon: Box,
    title: "Per-User Containers",
    body: "Every user gets a dedicated Docker container. Fully isolated, no shared state.",
  },
  {
    icon: Zap,
    title: "Zero Setup",
    body: "Sign in with Google. Your cloud workspace is ready in seconds - no local install required.",
  },
] as const;

const USE_CASES = [
  "Node.js & npm projects",
  "Python scripts & notebooks",
  "Rust & Cargo builds",
  "REST APIs & microservices",
  "Shell automation & scripting",
  "Git workflows",
  "Learning & experimentation",
  "Team prototyping",
] as const;

const TECH_STACK = [
  { stat: "Rust", label: "WebSocket server" },
  { stat: "Go", label: "Auth service" },
  { stat: "Docker", label: "Per-user isolation" },
] as const;

export default function LandingPage() {
  useGSAP(() => {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".gsap-hero-badge", { opacity: 0, y: 24, duration: 0.5 })
      .from(".gsap-hero-title", { opacity: 0, y: 36, duration: 0.8 }, "-=0.3")
      .from(".gsap-hero-tagline", { opacity: 0, y: 20, duration: 0.7 }, "-=0.4")
      .from(".gsap-hero-desc", { opacity: 0, y: 16, duration: 0.6 }, "-=0.4")
      .from(".gsap-hero-cta", { opacity: 0, y: 12, duration: 0.5 }, "-=0.35")
      .from(".gsap-hero-scroll", { opacity: 0, duration: 0.5 }, "-=0.2");

    ScrollTrigger.create({
      start: 60,
      onEnter: () =>
        gsap.to(".gsap-nav", {
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(6,8,16,0.7)",
          borderBottomColor: "rgba(255,255,255,0.06)",
          duration: 0.3,
        }),
      onLeaveBack: () =>
        gsap.to(".gsap-nav", {
          backdropFilter: "blur(0px)",
          backgroundColor: "transparent",
          borderBottomColor: "transparent",
          duration: 0.3,
        }),
    });

    gsap.from(".gsap-video", {
      scrollTrigger: { trigger: ".gsap-video", start: "top 85%" },
      opacity: 0,
      y: 60,
      scale: 0.97,
      duration: 0.9,
      ease: "power2.out",
    });

    gsap.from(".gsap-feature-card", {
      scrollTrigger: { trigger: ".gsap-features", start: "top 78%" },
      opacity: 0,
      y: 40,
      duration: 0.6,
      stagger: 0.12,
      ease: "power2.out",
    });

    gsap.from(".gsap-use-case", {
      scrollTrigger: { trigger: ".gsap-use-cases", start: "top 80%" },
      opacity: 0,
      y: 20,
      scale: 0.94,
      duration: 0.4,
      stagger: 0.04,
      ease: "back.out(1.5)",
    });

    gsap.from(".gsap-tech-stat", {
      scrollTrigger: { trigger: ".gsap-tech", start: "top 82%" },
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
    });

    gsap.from(".gsap-cta-section > *", {
      scrollTrigger: { trigger: ".gsap-cta-section", start: "top 82%" },
      opacity: 0,
      y: 24,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });
  });

  return (
    <TextureBg
      opacity={0.2}
      className="flex flex-col gap-8 min-h-screen items-center justify-center rounded-2xl text-black bg-[radial-gradient(ellipse_at_top,#0d1117_0%,#060810_55%,#000000_100%)]"
    >
      <nav
        className="gsap-nav fixed top-0 inset-x-0 z-50 border-b border-transparent"
        style={{ backdropFilter: "blur(0px)" }}
      >
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
          <div className="gsap-hero-badge flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-900 bg-zinc-800">
            <span className="text-xs text-white/50 tracking-widest uppercase">
              Cloud-Native Development
            </span>
          </div>

          <div className="gsap-hero-title">
            <LineShadowText
              as="h1"
              shadowColor="#3b82f6"
              className="text-6xl sm:text-8xl font-bold text-white tracking-tight"
            >
              IDE
            </LineShadowText>
          </div>

          <div className="gsap-hero-tagline">
            <KineticText
              text="Code anywhere. Ship everywhere."
              className="text-[3rem] tracking-[-5%] [font-optical-sizing:auto] text-white"
            />
          </div>

          <p className="gsap-hero-desc text-sm text-white/40 leading-relaxed max-w-md">
            A fully-functional Linux development environment in your browser.
            Real shell. Real editor. Real containers. No setup required.
          </p>

          <div className="gsap-hero-cta flex flex-col sm:flex-row items-center gap-4">
            <Link href="/auth">
              <SlideButton design="obsidian" className="px-10 py-4 text-sm">
                Get Started
              </SlideButton>
            </Link>
          </div>
        </div>

        <div className="gsap-hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="text-xs text-white/40 tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-px h-8 bg-linear-to-b from-white/20 to-transparent" />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <RadialSeparator />
      </div>

      <section className="gsap-video py-12 px-6 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full">
            <div className="absolute -inset-4 bg-blue-500/8 blur-3xl rounded-full pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.8)] aspect-video">
              <iframe
                src={VIDEO_EMBED_URL}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
                title="IDE demo"
              />
              <div className="absolute top-0 right-0 w-14 h-12 bg-black z-10" />
            </div>
          </div>
        </div>
      </section>

      <section className="gsap-features py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="gsap-feature-card bg-zinc-900/40 border border-white/6 rounded-2xl p-6 flex flex-col gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <Icon size={16} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gsap-use-cases py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <p className="text-xs text-white/30 tracking-widest uppercase text-center">
            What you can build
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {USE_CASES.map((label) => (
              <div
                key={label}
                className="gsap-use-case bg-zinc-900/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/60 hover:text-white/90 hover:border-white/15 transition-colors text-center"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gsap-tech py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-8">
          <div className="flex items-center justify-center divide-x divide-white/10 w-full">
            {TECH_STACK.map(({ stat, label }) => (
              <div
                key={stat}
                className="gsap-tech-stat flex flex-col items-center gap-1.5 flex-1 px-4 sm:px-12"
              >
                <span className="text-xl sm:text-2xl font-bold text-white text-center">
                  {stat}
                </span>
                <span className="text-[10px] sm:text-xs text-white/40 tracking-wide uppercase text-center whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-400/60 italic text-center max-w-sm">
            Coming soon: AI coding assistant - shell autocomplete, error
            explanation, and AI-suggested fixes directly inside the IDE.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <RadialSeparator />
      </div>

      <section className="py-24 px-6 relative overflow-hidden">
        <div className="gsap-cta-section relative max-w-4xl mx-auto flex flex-col items-center gap-6 text-center">
          <span className="text-xs text-blue-500/70 tracking-widest uppercase">
            Open Beta
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Your cloud workspace,
            <br />
            <span className="text-white/35">ready in seconds.</span>
          </h2>
          <p className="text-sm text-white/40 max-w-sm leading-relaxed">
            A real Linux shell, a real editor, real containers. Sign in with
            Google - no install required.
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
