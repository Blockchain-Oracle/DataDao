import { Address } from "viem";

export type RewardStatus = "pending" | "claimable" | "claimed";

export interface TaskReward {
  taskId: number;
  amount: bigint;
  deadline: number;
  status: RewardStatus;
  tokenAddress: Address;
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface RewardsState {
  userBalance: bigint;
  claimableRewards: TaskReward[];
  pendingRewards: TaskReward[];
  claimedRewards: TaskReward[];
  totalClaimable: bigint;
  totalPending: bigint;
  isLoading: boolean;
  error: Error | null;
}
