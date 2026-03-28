import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});



export const metadata: Metadata = {
  title: "Breeze Minimal — Weather at a Glance",
  description:
    "A beautifully minimal weather application with current conditions, 7-day forecast, and historical weather data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full antialiased overflow-x-hidden", spaceGrotesk.variable)}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
          precedence="default"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
