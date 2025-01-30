import { useReadContract } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/config/wagmi";
import { useRewards } from "./useRewards";
import { useAllTasks } from "./useTaskDetails";
import { formatEther } from "viem";

export type TimeFrame = "week" | "month" | "year";

interface AnalyticsData {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalRewardsDistributed: string;
  averageRewardPerTask: string;
  averageParticipation: number;
  completionRate: number;
  tasksByDate: Record<string, number>;
  participationByDate: Record<string, number>;
  rewardsByDate: Record<string, number>;
}

export function useAnalytics(timeframe: TimeFrame = "week") {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get task counter from contract
  const { data: taskCount } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTaskIdCounter",
    config: wagmiConfig,
  });

  // Get all tasks
  const { tasks } = useAllTasks();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);

        // Calculate date range based on timeframe
        const now = new Date();
        const startDate = new Date();
        switch (timeframe) {
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
          case "year":
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        // Process tasks data
        const tasksByDate: Record<string, number> = {};
        const participationByDate: Record<string, number> = {};
        const rewardsByDate: Record<string, number> = {};

        let totalRewards = BigInt(0);
        let totalParticipants = 0;
        let completedTasks = 0;
        let activeTasks = 0;

        tasks.forEach((task) => {
          const taskDate = new Date(Number(task.deadline) * 1000);
          const dateKey = taskDate.toISOString().split("T")[0];

          // Count tasks by date
          tasksByDate[dateKey] = (tasksByDate[dateKey] || 0) + 1;

          // Count participants by date
          const participantCount = task.participants?.length || 0;
          participationByDate[dateKey] =
            (participationByDate[dateKey] || 0) + participantCount;
          totalParticipants += participantCount;

          // Sum rewards by date
          const reward = task.totalReward;
          rewardsByDate[dateKey] =
            (rewardsByDate[dateKey] || 0) + Number(formatEther(reward));
          totalRewards += reward;

          // Count task status
          if (task.rewardsDistributed) {
            completedTasks++;
          } else if (Number(task.deadline) > Date.now() / 1000) {
            activeTasks++;
          }
        });

        setAnalyticsData({
          totalTasks: tasks.length,
          activeTasks,
          completedTasks,
          totalRewardsDistributed: formatEther(totalRewards),
          averageRewardPerTask: formatEther(
            totalRewards / BigInt(tasks.length || 1)
          ),
          averageParticipation: totalParticipants / (tasks.length || 1),
          completionRate: completedTasks / (tasks.length || 1),
          tasksByDate,
          participationByDate,
          rewardsByDate,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch analytics")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, tasks, taskCount]);

  return {
    data: analyticsData,
    isLoading,
    error,
  };
}
