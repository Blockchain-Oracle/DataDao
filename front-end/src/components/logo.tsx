"use client";

import { Box } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <Box className="h-8 w-8 text-primary animate-pulse" />
        <div className="absolute inset-0 blur-sm bg-primary/50 animate-pulse" />
      </div>
      <span className="font-bold text-xl tracking-tight">
        <span className="text-gradient">DataDAO</span>
      </span>
    </Link>
  );
}
