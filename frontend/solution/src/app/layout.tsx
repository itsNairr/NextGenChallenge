import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { THEME_SCRIPT } from "@/composables/themeScript";
import "./globals.css";

// Stand in for FT System Blank, the licensed Electric Mind typeface.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Stand in for FT System Mono, used for eyebrows and buttons.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio Dashboard",
  description: "Wealth management portfolio dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
