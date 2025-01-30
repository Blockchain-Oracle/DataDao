import { useReadContract, useWriteContract } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { Address } from "viem";
import { useState, useEffect } from "react";
import { readContract } from "wagmi/actions";
import { wagmiConfig } from "@/config/wagmi";

/**
 * Hook for managing rewards and token operations in the DataDAO platform.
 * Provides functionality to check claimable rewards across all participated tasks.
 *
 * @param address - The wallet address of the user
 * @returns Object containing reward data and functions to interact with rewards
 */
export function useRewards(address: Address) {
  const [participatedTasks, setParticipatedTasks] = useState<bigint[]>([]);
  const [totalClaimableReward, setTotalClaimableReward] = useState<bigint>(
    BigInt(0)
  );
  const [isLoading, setIsLoading] = useState(true);

  // Get tasks where user is participant
  const { data: taskIds } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTasksByParticipant",
    args: [address],
    config: wagmiConfig,
  });

  // Contract write functions
  const { data: claimRewardHash, writeContract: writeClaimReward } =
    useWriteContract();
  const { data: depositTokensHash, writeContract: writeDepositTokens } =
    useWriteContract();

  // Fetch claimable rewards for all participated tasks
  useEffect(() => {
    if (!taskIds || !address) {
      setIsLoading(false);
      return;
    }

    const fetchClaimableRewards = async () => {
      try {
        setIsLoading(true);
        const tasks = taskIds as bigint[];
        setParticipatedTasks(tasks);

        // Get claimable rewards for each task
        const rewardPromises = tasks.map(async (taskId) => {
          const reward = await readContract(wagmiConfig, {
            ...wagmiContractConfig,
            functionName: "getClaimableReward",
            args: [taskId, address],
          });
          return reward as bigint;
        });

        const rewards = await Promise.all(rewardPromises);
        const total = rewards.reduce((sum, reward) => sum + reward, BigInt(0));
        setTotalClaimableReward(total);
      } catch (err) {
        console.error("Error fetching rewards:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaimableRewards();
  }, [taskIds, address]);

  /**
   * Claims available rewards for all participated tasks
   */
  const claimReward = async () => {
    for (const taskId of participatedTasks) {
      await writeClaimReward({
        ...wagmiContractConfig,
        functionName: "claimReward",
        args: [taskId],
      });
    }
  };

  /**
   * Deposits tokens into the platform
   * @param amount - The amount of tokens to deposit
   */
  const depositTokens = (amount: bigint) => {
    writeDepositTokens({
      ...wagmiContractConfig,
      functionName: "depositTokens",
      args: [amount],
    });
  };

  return {
    claimableReward: totalClaimableReward,
    participatedTasks,
    isLoading,
    claimRewardHash,
    depositTokensHash,
    claimReward,
    depositTokens,
  };
}
