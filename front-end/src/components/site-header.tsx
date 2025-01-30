"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { MainNav } from "@/components/main-nav";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useScroll } from "@/hooks/use-scroll";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const scrolled = useScroll(50);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full",
        "transition-all duration-500",
        scrolled
          ? "backdrop-blur-2xl bg-background/95 border-b border-border/50 shadow-lg"
          : "bg-background/80 border-transparent"
      )}
    >
      <div className="container flex h-14 sm:h-16 md:h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 md:gap-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-violet-500 to-secondary rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-xl bg-black/95 dark:bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-2xl shadow-xl">
                <span className="font-bold text-base sm:text-lg md:text-xl bg-gradient-to-br from-primary via-violet-400 to-secondary bg-clip-text text-transparent">
                  DL
                </span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-base sm:text-lg md:text-xl bg-gradient-to-br from-primary via-violet-400 to-secondary bg-clip-text text-transparent">
                DataLabel
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground/80 font-medium">
                Web3 Data Labeling Platform
              </span>
            </div>
          </motion.div>
          <div className="hidden md:block">
            <MainNav />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2 sm:gap-4 md:gap-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <ThemeToggle />
            <UserNav />
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-background">
                <div className="mt-6">
                  <MainNav mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
