"use client";

import { TaskCard } from "@/components/task/task-card";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import {
  Filter,
  LayoutGrid,
  LayoutList,
  Loader2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAllTasks } from "@/hooks/useTaskDetails";
import { formatEther } from "viem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption =
  | "newest"
  | "oldest"
  | "reward-high"
  | "reward-low"
  | "deadline";

export default function TasksPage() {
  const { address } = useAccount();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [dateRange, setDateRange] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  const { tasks, isLoading, error, hasMore, loadMoreRef } = useAllTasks(
    Number(pageSize)
  );

  // Transform and sort tasks
  const transformedTasks = useMemo(() => {
    if (!tasks) return [];
    console.log(tasks);
    let sortedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.metadata?.title || "",
      description: task.metadata?.description || "",
      creator: task.creator,
      totalReward: Number(formatEther(task.totalReward)),
      deadline: Number(task.deadline),
      participantCount: task.participants?.length || 0,
      hasParticipated: task.participants?.includes(address as `0x${string}`),
      images: task.metadata?.images?.map((img) => ({
        cid: img.cid,
        url: img.url,
        label: img.label,
      })),
      options: task.metadata?.options || [],
      tokenAddress: task.tokenAddress,
      createdAt: task.metadata?.createdAt,
    }));

    // Apply sorting
    switch (sortBy) {
      case "newest":
        sortedTasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
      case "oldest":
        sortedTasks.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        break;
      case "reward-high":
        sortedTasks.sort((a, b) => b.totalReward - a.totalReward);
        break;
      case "reward-low":
        sortedTasks.sort((a, b) => a.totalReward - b.totalReward);
        break;
      case "deadline":
        sortedTasks.sort((a, b) => a.deadline - b.deadline);
        break;
    }

    return sortedTasks;
  }, [tasks, address, sortBy]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!transformedTasks) return [];

    return transformedTasks.filter((task) => {
      const isExpired = new Date(task.deadline * 1000) < new Date();
      const now = Date.now();
      const taskDate = task.createdAt
        ? new Date(task.createdAt * 1000)
        : new Date();

      // Status filter
      if (filter !== "all") {
        if (filter === "active" && isExpired) return false;
        if (filter === "expired" && !isExpired) return false;
      }

      // Date range filter
      switch (dateRange) {
        case "today":
          if (taskDate.getTime() < now - 86400000) return false;
          break;
        case "week":
          if (taskDate.getTime() < now - 604800000) return false;
          break;
        case "month":
          if (taskDate.getTime() < now - 2592000000) return false;
          break;
      }

      return true;
    });
  }, [transformedTasks, filter, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / Number(pageSize));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * Number(pageSize),
    currentPage * Number(pageSize)
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Available Tasks</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("reward-high")}>
                Highest Reward
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("reward-low")}>
                Lowest Reward
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("deadline")}>
                Deadline
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("active")}>
                Active Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("expired")}>
                Expired Tasks
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Date Range</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setDateRange("all")}>
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("today")}>
                Last 24 Hours
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("week")}>
                Last Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("month")}>
                Last Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <LayoutList className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Tasks Grid/List */}
      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex justify-center py-8"
            >
              <Loader2 className="h-8 w-8 animate-spin" />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center text-red-500 py-8"
            >
              {error.message}
            </motion.div>
          ) : (
            paginatedTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TaskCard {...task} variant={viewMode} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={pageSize}
            onValueChange={(value) => {
              setPageSize(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && !isLoading && <div ref={loadMoreRef} className="h-10" />}
    </div>
  );
}
