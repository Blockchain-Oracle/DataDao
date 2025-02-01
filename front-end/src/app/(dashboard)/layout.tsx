"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  History,
  Award,
  BarChart3,
  Settings,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Available Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    title: "My Tasks",
    href: "/dashboard/my-tasks",
    icon: History,
  },
  {
    title: "Participated",
    href: "/dashboard/participated",
    icon: Award,
  },
  {
    title: "Rewards",
    href: "/dashboard/rewards",
    icon: Award,
  },
  {
    title: "NFT Stats",
    href: "/dashboard/nft-stats",
    icon: Award,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/profile",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();
  const router = useRouter();
  
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />

        <div className="flex-1 flex pt-16">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 border-r shrink-0">
            <nav className="sticky top-[64px] space-y-1 p-4">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Mobile sidebar */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden fixed left-4 top-20 z-40"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <nav className="space-y-1 p-4">
                {sidebarNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Main content */}
          <main className="flex-1 overflow-x-hidden">
            <div className="flex justify-between items-center border-b pb-4">
              <Breadcrumbs />
            </div>
            <div className="container py-6">{children}</div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
