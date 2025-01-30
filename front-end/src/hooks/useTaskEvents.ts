import { useWatchContractEvent } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { wagmiConfig } from "@/config/wagmi";

export function useTaskEvents() {
  // Events
  useWatchContractEvent({
    ...wagmiContractConfig,
    config: wagmiConfig,
    eventName: "TaskCreated",
    onLogs(logs) {
      // Update UI
      console.log("Task created:", logs);
    },
  });
  // Watch for task participation
  useWatchContractEvent({
    ...wagmiContractConfig,
    config: wagmiConfig,
    eventName: "TaskPerformed",
    onLogs(logs) {
      console.log("Task performed:", logs);
    },
  });

  // Watch for rewards distribution
  useWatchContractEvent({
    ...wagmiContractConfig,
    config: wagmiConfig,
    eventName: "RewardsDistributed",
    onLogs(logs) {
      console.log("Rewards distributed:", logs);
    },
  });

  // Watch for reward claims
  useWatchContractEvent({
    ...wagmiContractConfig,
    config: wagmiConfig,
    eventName: "RewardClaim",
    onLogs(logs) {
      console.log("Reward claimed:", logs);
    },
  });
}
