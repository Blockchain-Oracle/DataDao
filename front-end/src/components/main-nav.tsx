"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const routes = [
    { name: "Explore", href: "/dashboard/tasks" },
    { name: "My Tasks", href: "/dashboard/my-tasks" },
    { name: "Rewards", href: "/dashboard/rewards" },
  ];

  return (
    <nav
      className={cn(
        mobile ? "flex flex-col gap-1" : "hidden md:flex flex-row gap-1"
      )}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
            "hover:bg-accent/10 hover:text-primary",
            pathname === route.href
              ? "bg-accent/10 text-primary" 
              : "text-muted-foreground"
          )}
        >
          {route.name}
        </Link>
      ))}
    </nav>
  );
}
