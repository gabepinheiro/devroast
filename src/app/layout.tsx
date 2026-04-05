import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevRoast",
  description: "DevRoast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} ${ibmPlexMono.variable}`}>
        <Navbar />
        <div className="mx-auto w-full max-w-page">{children}</div>
      </body>
    </html>
  );
}
