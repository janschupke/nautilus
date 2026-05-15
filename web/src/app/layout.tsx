import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import nautilusIcon from "@/app/icon.png";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nautilus",
  description: "Interactive checks for Nautilus modules",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 font-sans text-zinc-100">
        {/* Narrow-screen notice — hidden at ≥800px */}
        <div className="flex h-screen flex-col items-center justify-center gap-6 px-8 text-center min-[800px]:hidden">
          <Image src={nautilusIcon} alt="Nautilus" width={400} height={400} className="opacity-60" />
          <p className="text-lg font-medium text-zinc-200">Nautilus is not supported on small screens.</p>
          <p className="text-base text-zinc-500">Open the site on a device with a screen width of at least 800 px.</p>
        </div>
        {/* Full app — hidden below 800px */}
        <div className="hidden min-[800px]:block min-[800px]:contents">
          <AppShell>{children}</AppShell>
        </div>
      </body>
    </html>
  );
}
