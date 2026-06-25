import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "IDE",
  description:
    "A fully-functional Linux development environment in your browser. Real shell. Real editor. Real containers. No setup required.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "IDE - Cloud Development Environment",
    description:
      "Code anywhere. Ship everywhere. Real Linux shell, Monaco editor, isolated Docker containers. No setup required.",
    images: [
      { url: "/image.png", width: 1280, alt: "IDE workspace screenshot" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IDE - Cloud Development Environment",
    description: "Code anywhere. Ship everywhere.",
    images: ["/image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className="bg-(--color-background) text-(--color-foreground) antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{
              success: {
                className:
                  "bg-[var(--color-card)] text-[var(--color-success)] font-semibold border border-[var(--color-border)] rounded-md",
              },
              error: {
                className:
                  "bg-[var(--color-card)] text-[var(--color-destructive)] font-semibold border border-[var(--color-destructive-border)] rounded-xl shadow-lg",
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
