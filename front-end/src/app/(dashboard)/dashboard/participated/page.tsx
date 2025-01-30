"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  Award,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useUserParticipatedTasks } from "@/hooks/useTaskDetails";

export default function ParticipatedPage() {
  const [timeframe, setTimeframe] = useState<string>("all");
  const [activeView, setActiveView] = useState<"list" | "analytics">("list");
  const { tasks, isLoading, error } = useUserParticipatedTasks();

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    pendingRewards: tasks
      .filter((t) => !t.rewardsDistributed && t.status === "completed")
      .reduce((acc, t) => Number(t.totalReward), 0),
    averageQualityScore: 0,
  };

  const statusIcons = {
    completed: <CheckCircle className="h-4 w-4 text-green-500" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
    expired: <AlertTriangle className="h-4 w-4 text-gray-500" />,
  };

  if (isLoading) return <LoadingState />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Task Participation Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive view of your contributions and rewards
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <Button
            variant={activeView === "list" ? "default" : "outline"}
            onClick={() => setActiveView("list")}
            className="text-sm"
          >
            List View
          </Button>
          <Button
            variant={activeView === "analytics" ? "default" : "outline"}
            onClick={() => setActiveView("analytics")}
            className="text-sm"
          >
            Analytics
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {activeView === "list" ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    My Participations
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Track your task participation and rewards
                  </p>
                </div>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Participations
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                      {stats.totalTasks}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.completedTasks} completed tasks
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Rewards
                    </CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">
                      {stats.pendingRewards} tokens
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Available to claim
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Participation History</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Deadline
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Reward
                        </TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Link
                              href={`/dashboard/tasks/${task.id}`}
                              className="flex items-center hover:underline"
                            >
                              <span className="truncate max-w-[150px] sm:max-w-none">
                                {task.metadata?.title || `Task #${task.id}`}
                              </span>
                              <ArrowUpRight className="ml-1 h-4 w-4 flex-shrink-0" />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {statusIcons[task.status]}
                              <span className="capitalize">{task.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {formatDistanceToNow(
                              new Date(Number(task.deadline) * 1000),
                              {
                                addSuffix: true,
                              }
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              {Number(task.totalReward)} tokens
                              {task.rewardsDistributed && (
                                <Badge variant="secondary">Claimed</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="whitespace-nowrap"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Task analytics features are under development.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
