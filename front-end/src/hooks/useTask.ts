import { useReadContract } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { Address } from "viem";
import { wagmiConfig } from "@/config/wagmi";

/**
 * Hook for interacting with task-related data from the smart contract.
 * This hook provides comprehensive access to task information and user interactions
 * with tasks on the platform.
 *
 * @param taskId - The ID of the task to query
 * @param address - Optional wallet address for user-specific queries
 * @returns An object containing various task-related data and user interactions
 */
export function useTask(taskId: number, address?: Address) {
  /**
   * Fetches detailed information about a specific task
   * @returns Task data including creator, reward, deadline, and status
   */
  const { data: task } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTaskIdToTask",
    config: wagmiConfig,
    args: [taskId],
  });

  /**
   * Retrieves the list of participants for a specific task
   * @returns Array of wallet addresses that have participated in the task
   */
  const { data: participants } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getParticipants",
    config: wagmiConfig,
    args: [taskId],
  });

  /**
   * Checks if a specific address has participated in the task
   * @returns Boolean indicating participation status
   */
  const { data: hasParticipated } = useReadContract({
    ...wagmiContractConfig,
    functionName: "hasParticipated",
    config: wagmiConfig,
    args: [taskId, address],
  });

  /**
   * Fetches all tasks created by a specific address
   * @returns Array of task IDs created by the address
   */
  const { data: tasksByCreator } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTasksByCreator",
    config: wagmiConfig,
    args: [address],
  });

  /**
   * Gets all tasks that a user has participated in
   * @returns Array of task IDs the user has participated in
   */
  const { data: tasksByParticipant } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTasksByParticipant",
    config: wagmiConfig,
    args: [address],
  });

  /**
   * Gets the total number of tasks created on the platform
   * @returns Current task counter as a bigint
   */
  const { data: taskCount } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTaskIdCounter",
    args: [],
  });

  /**
   * Retrieves the token balance for a specific address
   * @returns User's token balance as a bigint
   */
  const { data: userBalance } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getUserBalance",
    args: [address],
  });

  return {
    task,
    participants,
    hasParticipated,
    tasksByCreator,
    taskCount,
    userBalance,
    tasksByParticipant,
  };
}
