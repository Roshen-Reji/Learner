import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import PWAProvider from "@/components/PWAProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0ea5e9",
};

export const metadata: Metadata = {
  title: "IEEE Learn | Level Up Your Career",
  description:
    "A gamified learning platform for IEEE members. Master aptitude, coding, roadmaps, and compete on the leaderboard.",
  keywords: ["IEEE", "learning", "aptitude", "coding", "roadmap", "leaderboard", "placement"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Providers>
          <PWAProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
