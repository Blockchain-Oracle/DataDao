"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Filter, Loader2, LayoutGrid, LayoutList } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TaskCard } from "@/components/task/task-card";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { CreateTaskModal } from "@/components/task/create-task-modal";
import {
  useUserCreatedTasks,
  useUserParticipatedTasks,
} from "@/hooks/useTaskDetails";
import { formatEther } from "viem";

export default function MyTasksPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("created");
  const { tasks: blockchainCreatedTasks, isLoading: createdTasksLoading } =
    useUserCreatedTasks();
  const {
    tasks: blockchainParticipatedTasks,
    isLoading: participatedTasksLoading,
  } = useUserParticipatedTasks();

  // Transform blockchain tasks using useMemo
  const transformedCreatedTasks = useMemo(() => {
    if (!blockchainCreatedTasks) return [];
    return blockchainCreatedTasks.map((task) => ({
      id: task.id,
      title: task.metadata?.title || "Untitled Task",
      description: task.metadata?.description || "",
      autoDriveCid: task.autoDriveCid,
      creator: task.creator,
      totalReward: Number(formatEther(task.totalReward)),
      deadline: Number(task.deadline),
      participantCount: task.participants?.length || 0,
      isCreator: true,
      status: task.status,
      imageUrl:
        task.metadata?.images?.[0]?.url ||
        "/task-images/image-classification.jpg",
      options: task.metadata?.options || [],
      tokenAddress: task.tokenAddress,
    }));
  }, [blockchainCreatedTasks]);

  const transformedParticipatedTasks = useMemo(() => {
    if (!blockchainParticipatedTasks) return [];
    console.log(blockchainParticipatedTasks, "participated,mytask");
    return blockchainParticipatedTasks.map((task) => ({
      id: task.id,
      title: task.metadata?.title || "Untitled Task",
      description: task.metadata?.description || "",
      autoDriveCid: task.autoDriveCid,
      creator: task.creator,
      totalReward: Number(formatEther(task.totalReward)),
      deadline: Number(task.deadline),
      participantCount: task.participants?.length || 0,
      isCreator: false,
      status: task.status,
      imageUrl:
        task.metadata?.images?.[0]?.url ||
        "/task-images/image-classification.jpg",
      options: task.metadata?.options || [],
      tokenAddress: task.tokenAddress,
    }));
  }, [blockchainParticipatedTasks]);

  // Filter tasks using useMemo
  const filterTasks = useMemo(() => {
    return (tasks: typeof transformedCreatedTasks) => {
      if (activeFilter === "all") return tasks;
      return tasks.filter(
        (task) => task.status.toLowerCase() === activeFilter.toLowerCase()
      );
    };
  }, [activeFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              My Tasks
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your Web3 tasks and contributions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "hidden sm:inline-flex items-center justify-center",
                  viewMode === "grid" && "bg-accent text-accent-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn(
                  "hidden sm:inline-flex items-center justify-center",
                  viewMode === "list" && "bg-accent text-accent-foreground"
                )}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="created">Created Tasks</TabsTrigger>
              <TabsTrigger value="participated">Participated Tasks</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                {activeFilter === "all" ? "All Tasks" : `${activeFilter} Tasks`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setActiveFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveFilter("active")}>
                Active Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("completed")}>
                Completed Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFilter("expired")}>
                Expired Tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {createdTasksLoading || participatedTasksLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <Loader2 className="h-8 w-8 animate-spin" />
          </motion.div>
        ) : (
          <Tabs value={activeTab} className="space-y-6">
            <TabsContent value="created">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {filterTasks(transformedCreatedTasks).length === 0 ? (
                  <Card className="col-span-full p-12">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                      <Image
                        src="/empty-tasks.svg"
                        alt="No tasks"
                        width={200}
                        height={200}
                        className="mb-4"
                      />
                      <h3 className="text-lg font-semibold">
                        No tasks created yet
                      </h3>
                      <p className="text-muted-foreground">
                        Create your first Web3 task to get started
                      </p>
                      <CreateTaskModal />
                    </CardContent>
                  </Card>
                ) : (
                  filterTasks(transformedCreatedTasks).map((task) => (
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
              </motion.div>
            </TabsContent>

            <TabsContent value="participated">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {filterTasks(transformedParticipatedTasks).length === 0 ? (
                  <Card className="col-span-full p-12">
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                      <Image
                        src="/empty-tasks.svg"
                        alt="No tasks"
                        width={200}
                        height={200}
                        className="mb-4"
                      />
                      <h3 className="text-lg font-semibold">
                        No participated tasks yet
                      </h3>
                      <p className="text-muted-foreground">
                        Start participating in tasks to see them here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filterTasks(transformedParticipatedTasks).map((task) => (
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
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      </AnimatePresence>
    </div>
  );
}
