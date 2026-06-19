import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aks IDE",
  description: "Cloud-based development environment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-(--color-background) text-(--color-foreground) antialiased" suppressHydrationWarning>
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
