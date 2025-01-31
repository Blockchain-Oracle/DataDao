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
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent font-bold text-sm sm:text-base">
                DL
              </span>
            </div>
            <span className="hidden sm:inline-block">DataDao</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isConnected ? (
            <>
              <div className="hidden sm:block">
                <CreateTaskModal />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => setIsDepositModalOpen(true)}
              >
                Deposit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary text-[8px] sm:text-[10px] font-medium flex items-center justify-center text-primary-foreground">
                      2
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[250px] sm:w-[300px]">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm">
                    New bid on your task "Image Classification"
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm">
                    Your submission was accepted
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserNav />
            </>
          ) : (
            <ConnectButton />
          )}

          <ThemeToggle />
        </div>
      </div>

      {/* Mobile bottom navigation for connected users */}
      {isConnected && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 border-t bg-background px-4 py-2 flex items-center justify-around">
          <CreateTaskModal />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDepositModalOpen(true)}
          >
            Deposit
          </Button>
        </div>
      )}

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
    </header>
  );
}
