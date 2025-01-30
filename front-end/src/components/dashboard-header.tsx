"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTaskModal } from "@/components/task/create-task-modal";
import { UserNav } from "./user-nav";
import { DepositModal } from "./modals/deposit-modal";
import { useState } from "react";

export function DashboardHeader() {
  const scrolled = useScroll(50);
  const { isConnected } = useAccount();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        scrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-background"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent font-bold">
                DL
              </span>
            </div>
            <span className="hidden sm:inline-block">DataLabel</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <CreateTaskModal />
              <Button
                variant="outline"
                onClick={() => setIsDepositModalOpen(true)}
              >
                Deposit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                      2
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px]">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    New bid on your task "Image Classification"
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Your submission was accepted
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* <ConnectButton
                showBalance={false}
                accountStatus="avatar"
                chainStatus="icon"
              /> */}
              <UserNav />
            </>
          ) : (
            <ConnectButton />
          )}

          <ThemeToggle />
        </div>
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </header>
  );
}
