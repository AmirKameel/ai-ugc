import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";

export const metadata: Metadata = {
  title: "Supernova",
  description: "AI-powered UGC video generation with Tavus",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="font-sans antialiased">
        <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}