import { useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { Address } from "viem";
import { wagmiConfig } from "@/config/wagmi";
import { performanceNftConfig } from "@/lib/constant";

export interface UserPerformanceData {
  tasksCompleted: bigint;
  lastUpdateBlock: bigint;
  currentLevel: number;
  tokenId?: bigint;
  levelTitle: 'rookie' | 'intermediate' | 'expert' | 'master';
}

// Mapping of array indices to performance data fields
const PERFORMANCE_DATA_MAPPING = {
  TASKS_COMPLETED: 0,
  LAST_UPDATE_BLOCK: 1,
  CURRENT_LEVEL: 2
} as const;

/**
 * Hook for accessing user's NFT performance data and ranking information
 * @param address - The wallet address of the user
 * @returns Object containing NFT performance data and ranking information
 */
export function useNFTPerformance(address?: Address) {
  const [performanceData, setPerformanceData] = useState<UserPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get user's performance data

  console.log(performanceNftConfig.address,"pre ass");
  const { data: performance, error: performanceError } = useReadContract({
    ...performanceNftConfig,
    functionName: "userPerformance",
    args: [address as Address],
    config: wagmiConfig,
    // enabled: !!address, // Only run query if address exists
  });

  console.log('Raw Performance Data:', performance);

  // Get user's NFT token ID
  const { data: tokenId } = useReadContract({
    ...performanceNftConfig,
    functionName: "tokenOfOwnerByIndex",
    args: [address, 0], // Get first NFT
    config: wagmiConfig,
  });

  // Get NFT metadata
  const { data: nftMetadata } = useReadContract({
    ...performanceNftConfig,
    functionName: "nftMetadata",
    args: [tokenId],
    config: wagmiConfig,
  });

  // Process and combine the data
  useEffect(() => {
    if (!address) {
      setPerformanceData(null);
      setIsLoading(false);
      return;
    }

    if (performanceError) {
      setError(new Error(`Failed to fetch performance: ${performanceError.message}`));
      setIsLoading(false);
      return;
    }

    if (!performance) {
      setIsLoading(true);
      return;
    }

    try {
      const levelTitles = {
        1: 'rookie',
        2: 'intermediate',
        3: 'expert',
        4: 'master'
      } as const;

      const performanceArray = performance as bigint[];
      console.log(performanceArray,"performance");
      const currentLevel = Number(performanceArray[PERFORMANCE_DATA_MAPPING.CURRENT_LEVEL]);
      
      const processedData: UserPerformanceData = {
        tasksCompleted: performanceArray[PERFORMANCE_DATA_MAPPING.TASKS_COMPLETED],
        lastUpdateBlock: performanceArray[PERFORMANCE_DATA_MAPPING.LAST_UPDATE_BLOCK],
        currentLevel,
        tokenId: tokenId ? BigInt(tokenId.toString()) : undefined,
        levelTitle: levelTitles[currentLevel as 1 | 2 | 3 | 4]
      };

      setPerformanceData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to process performance data"));
    } finally {
      setIsLoading(false);
    }
  }, [address, performance, performanceError, tokenId, nftMetadata]);
  console.log(performance,"pre");

  // Helper function to get evolution thresholds
  const getEvolutionThresholds = () => ({
    LEVEL_1_THRESHOLD: BigInt(5),
    LEVEL_2_THRESHOLD: BigInt(10),
    LEVEL_3_THRESHOLD: BigInt(15),
    LEVEL_4_THRESHOLD: BigInt(20)
  });

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    if (!performanceData) return 0;

    const thresholds = getEvolutionThresholds();
    const tasksCompleted = performanceData.tasksCompleted;

    switch (performanceData.currentLevel) {
      case 1:
        return Number((tasksCompleted * BigInt(100)) / thresholds.LEVEL_2_THRESHOLD);
      case 2:
        return Number((tasksCompleted * BigInt(100)) / thresholds.LEVEL_3_THRESHOLD);
      case 3:
        return Number((tasksCompleted * BigInt(100)) / thresholds.LEVEL_4_THRESHOLD);
      case 4:
        return 100;
      default:
        return 0;
    }
  };

  return {
    performanceData,
    isLoading,
    error,
    progressToNextLevel: getProgressToNextLevel(),
    thresholds: getEvolutionThresholds(),
    nftMetadata
  };
}