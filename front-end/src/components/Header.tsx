"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAccount } from "wagmi";
import Link from "next/link";

export function Header() {
  const { isConnected } = useAccount();

  return (
    <header className="border-b bg-background backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold text-foreground"
          >
            TaskMarket
          </Link>

          {isConnected && (
            <nav className="hidden sm:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/create">Create Task</Link>
              </Button>
              <Button variant="ghost">My Tasks</Button>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isConnected && (
            <Input
              placeholder="Search tasks..."
              className="hidden sm:block w-32 sm:w-48 transition-all focus:w-48 sm:focus:w-64"
            />
          )}

          <div className="scale-90 sm:scale-100">
            <ConnectButton
              showBalance={false}
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "address",
              }}
              chainStatus="icon"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
