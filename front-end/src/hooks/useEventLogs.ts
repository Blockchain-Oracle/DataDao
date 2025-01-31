import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { wagmiConfig } from "@/config/wagmi";
import { formatEther } from "viem";

interface EventLog {
  event: string;
  type: string;
  timestamp: number;
  amount?: string;
  taskId?: number;
}

export function useEventLogs(address?: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<EventLog[]>([]);

  // Get user deposits
  const { data: deposits } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getUserDeposits",
    args: [address],
    config: wagmiConfig,
  });

  // Get user withdrawals
  const { data: withdrawals } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getUserWithdrawals",
    args: [address],
    config: wagmiConfig,
  });

  // Get tasks created
  const { data: tasksCreated } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTasksByCreator",
    args: [address],
    config: wagmiConfig,
  });

  // Get tasks participated
  const { data: tasksParticipated } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTasksByParticipant",
    args: [address],
    config: wagmiConfig,
  });

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    const processLogs = () => {
      try {
        setIsLoading(true);
        const allLogs: EventLog[] = [];

        // Process deposits
        if (deposits) {
          deposits.forEach((deposit: any) => {
            allLogs.push({
              event: "Token Deposit",
              type: "DEPOSIT",
              timestamp: Number(deposit.timestamp),
              amount: formatEther(deposit.amount),
            });
          });
        }

        // Process withdrawals
        if (withdrawals) {
          withdrawals.forEach((withdrawal: any) => {
            allLogs.push({
              event: "Token Withdrawal",
              type: "WITHDRAWAL",
              timestamp: Number(withdrawal.timestamp),
              amount: formatEther(withdrawal.amount),
            });
          });
        }

        // Process tasks created
        if (tasksCreated) {
          tasksCreated.forEach((taskId: bigint) => {
            allLogs.push({
              event: "Task Created",
              type: "TASK",
              timestamp: Date.now(),
              taskId: Number(taskId),
            });
          });
        }

        // Process tasks participated
        if (tasksParticipated) {
          tasksParticipated.forEach((taskId: bigint) => {
            allLogs.push({
              event: "Task Participated",
              type: "PARTICIPATION",
              timestamp: Date.now(),
              taskId: Number(taskId),
            });
          });
        }

        // Sort logs by timestamp (newest first)
        allLogs.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(allLogs);
      } catch (error) {
        console.error("Error processing logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    processLogs();
  }, [address, deposits, withdrawals, tasksCreated, tasksParticipated]);

  return { logs, isLoading };
}
