"use client";

import { SiteFooter } from "@/components/site-footer";

export function DashboardContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background opacity-50" />
        <div className="absolute right-1/4 top-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute left-1/4 bottom-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <main className="container py-8 space-y-8">
        <div className="web3-panel p-6">
          <div className="gradient-border">
            <div className="rounded-2xl bg-card/80 backdrop-blur-xl p-6">
              {children}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
