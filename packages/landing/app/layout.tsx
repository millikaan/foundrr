import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Humanist grotesk. We lean on the light weights (300–400) for the
// oversized thin headlines that carry the whole design.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://foundrr.online"),
  title: "Founder — supervise your AI coding agents from anywhere",
  description:
    "Supervise your AI coding agents from anywhere — and watch the world's token spend in real time. Open-source, self-hosted dev supervision.",
  applicationName: "Founder",
  keywords: [
    "AI coding agents",
    "Claude Code",
    "token telemetry",
    "dev supervision",
    "open source",
    "self-hosted",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Founder — supervise your AI coding agents from anywhere",
    description:
      "Supervise your AI coding agents from anywhere — and watch the world's token spend in real time.",
    type: "website",
    url: "https://foundrr.online",
    siteName: "Founder",
  },
  twitter: {
    card: "summary_large_image",
    title: "Founder",
    description:
      "Supervise your AI coding agents from anywhere — and watch the world's token spend in real time.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f7f9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
