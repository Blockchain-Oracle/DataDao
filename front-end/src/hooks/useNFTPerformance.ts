import { useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { Address } from "viem";
import { wagmiConfig } from "@/config/wagmi";
import { performanceNftConfig } from "@/lib/constant";

export interface UserPerformanceData {
  tasksCompleted: bigint;
  totalQualityScore: bigint;
  averageQualityScore: bigint;
  currentLevel: number;
  highestQualityScore: bigint;
  consecutiveHighScores: bigint;
  tokenId?: bigint;
  levelTitle: 'rookie' | 'intermediate' | 'expert' | 'master';
}

// Mapping of array indices to performance data fields
const PERFORMANCE_DATA_MAPPING = {
  TASKS_COMPLETED: 0,
  TOTAL_QUALITY_SCORE: 1,
  AVERAGE_QUALITY_SCORE: 2,
  CURRENT_LEVEL: 3,
  HIGHEST_QUALITY_SCORE: 4,
  CONSECUTIVE_HIGH_SCORES: 5
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
  const { data: performance } = useReadContract({
    ...performanceNftConfig,
    functionName: "userPerformance",
    args: [address],
    config: wagmiConfig,
  });

  // Get user's NFT token ID
  const { data: tokenId } = useReadContract({
    ...performanceNftConfig,
    functionName: "tokenOfOwnerByIndex",
    args: [address, 0], // Get first NFT
    config: wagmiConfig,
  });

  // Get NFT metadata

  //   struct NFTMetadata {
//     uint8 level;
//     uint256 qualityScore;
//     uint256 lastEvolution;
//     string baseURI;
// }
  const { data: nftMetadata } = useReadContract({
    ...performanceNftConfig,
    functionName: "nftMetadata",
    args: [tokenId],
    config: wagmiConfig,
  });

  // Process and combine the data
  useEffect(() => {
    if (!address || !performance) {
      setPerformanceData(null);
      setIsLoading(false);
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
      const currentLevel = Number(performanceArray[PERFORMANCE_DATA_MAPPING.CURRENT_LEVEL]);
      
      const processedData: UserPerformanceData = {
        tasksCompleted: performanceArray[PERFORMANCE_DATA_MAPPING.TASKS_COMPLETED],
        totalQualityScore: performanceArray[PERFORMANCE_DATA_MAPPING.TOTAL_QUALITY_SCORE],
        averageQualityScore: performanceArray[PERFORMANCE_DATA_MAPPING.AVERAGE_QUALITY_SCORE],
        currentLevel,
        highestQualityScore: performanceArray[PERFORMANCE_DATA_MAPPING.HIGHEST_QUALITY_SCORE],
        consecutiveHighScores: performanceArray[PERFORMANCE_DATA_MAPPING.CONSECUTIVE_HIGH_SCORES],
        tokenId: tokenId ? BigInt(tokenId.toString()) : undefined,
        levelTitle: levelTitles[currentLevel as 1 | 2 | 3 | 4]
      };

      setPerformanceData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to process performance data"));
    } finally {
      setIsLoading(false);
    }
  }, [address, performance, tokenId, nftMetadata]);

  // Helper function to get evolution thresholds
  const getEvolutionThresholds = () => ({
    ROOKIE_THRESHOLD: BigInt(5),
    INTERMEDIATE_THRESHOLD: BigInt(20),
    EXPERT_THRESHOLD: BigInt(50),
    MASTER_THRESHOLD: BigInt(100),
    MIN_QUALITY_SCORE: BigInt(70)
  });

  // Calculate progress to next level
  const getProgressToNextLevel = () => {
    if (!performanceData) return 0;

    const thresholds = getEvolutionThresholds();
    const tasksCompleted = performanceData.tasksCompleted;

    switch (performanceData.currentLevel) {
      case 1:
        return Number((tasksCompleted * BigInt(100)) / thresholds.INTERMEDIATE_THRESHOLD);
      case 2:
        return Number((tasksCompleted * BigInt(100)) / thresholds.EXPERT_THRESHOLD);
      case 3:
        return Number((tasksCompleted * BigInt(100)) / thresholds.MASTER_THRESHOLD);
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

// bafkr6id4a246tmyoc7uwm6kxnphswlkwwfskwwriaxhssyz3c3nmhon6vm
//bafkr6ib2fy7qm2g7bul7ixpobu7gfgrfszxpfgj3uoth373c5qxrwaonbm