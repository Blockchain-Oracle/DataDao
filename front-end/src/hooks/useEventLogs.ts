import { useEffect, useState } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { wagmiContractConfig } from "@/lib/constant";
import { hardhat } from "viem/chains";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export function useEventLogs(address: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);

        // Fetch all relevant event logs
        const [
          depositLogs,
          withdrawLogs,
          taskCreatedLogs,
          taskPerformedLogs,
          rewardsDistributedLogs,
          rewardClaimLogs,
        ] = await Promise.all([
          // Token deposits
          publicClient.getLogs({
            address: wagmiContractConfig.address,
            event: parseAbiItem(
              "event TokensDeposited(address indexed user, uint256 amount)"
            ),
            fromBlock: 0n,
            toBlock: "latest",
          }),
          // Withdrawals
          publicClient.getLogs({
            address: wagmiContractConfig.address,
            event: parseAbiItem(
              "event Withdraw(address indexed user, uint256 amount)"
            ),
            fromBlock: 0n,
            toBlock: "latest",
          }),
          // Task creation
          publicClient.getLogs({
            address: wagmiContractConfig.address,
            event: parseAbiItem(
              "event TaskCreated(uint256 indexed taskId, address indexed creator)"
            ),
            fromBlock: 0n,
            toBlock: "latest",
          }),
          // Task participation
          publicClient.getLogs({
            address: wagmiContractConfig.address,
            event: parseAbiItem(
              "event TaskPerformed(uint256 indexed taskId, address indexed participant)"
            ),
            fromBlock: 0n,
            toBlock: "latest",
          }),
          // Rewards distribution
          publicClient.getLogs({
            address: wagmiContractConfig.address,
            event: parseAbiItem(
              "event RewardsDistributed(uint256 indexed taskId)"
            ),
            fromBlock: 0n,
            toBlock: "latest",
          }),
          // Reward claims
          publicClient.getLogs({
            address: wagmiContractConfig.address,
            event: parseAbiItem(
              "event RewardClaim(uint256 indexed taskId, address indexed participant, uint256 amount)"
            ),
            fromBlock: 0n,
            toBlock: "latest",
          }),
        ]);

        // Filter logs for the current user's address
        const userLogs = {
          deposits: depositLogs.filter((log) => log.args.user === address),
          withdrawals: withdrawLogs.filter((log) => log.args.user === address),
          tasksCreated: taskCreatedLogs.filter(
            (log) => log.args.creator === address
          ),
          tasksPerformed: taskPerformedLogs.filter(
            (log) => log.args.participant === address
          ),
          rewardsClaimed: rewardClaimLogs.filter(
            (log) => log.args.participant === address
          ),
        };

        setLogs(userLogs);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      fetchLogs();
    }
  }, [address]);

  return { logs, isLoading };
}
