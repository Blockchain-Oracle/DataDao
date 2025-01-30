"use client";

// import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "@/config/wagmi";
import { ThemeProvider } from "@/components/theme-provider";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { SupportChat } from "@/components/support-chat";

const inter = Inter({ subsets: ["latin"] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <ErrorBoundary> */}
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                {children}
                <Toaster />
                <SupportChat />
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
          {/* </ErrorBoundary> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
