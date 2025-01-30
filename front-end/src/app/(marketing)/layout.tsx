import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "@/app/globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "DataLabel Platform - Decentralized Data Labeling",
  description:
    "A decentralized platform for creating and participating in data labeling tasks",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geist.variable} font-sans antialiased`}>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-6xl mx-auto">{children}</div>
          </div>
          <SiteFooter />
        </main>
      </div>
    </div>
  );
}
