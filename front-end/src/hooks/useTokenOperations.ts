import {
  useWriteContract,
  useWatchContractEvent,
  useReadContract,
} from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { wagmiConfig } from "@/config/wagmi";
import { wagmiERC20MockConfig } from "@/lib/constant";
import { parseEther } from "viem";

export function useTokenOperations(address?: `0x${string}`) {
  // Write function for withdrawing tokens
  const { data: withdrawHash, writeContract: writeWithdraw } =
    useWriteContract();
  const { data: approveHash, writeContract: writeApprove } = useWriteContract();
  const { data: depositHash, writeContract: writeDeposit } = useWriteContract();

  // Get token allowance
  console.log("address", address);
  console.log("wagmiContractConfig.address", wagmiContractConfig.address);
  const { data: allowance } = useReadContract({
    ...wagmiERC20MockConfig,
    functionName: "allowance",
    args: address ? [address, wagmiContractConfig.address] : undefined,
    config: wagmiConfig,
  });

  console.log("allowance", allowance);

  // Get token balance
  const { data: balance } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getUserBalance",
    args: address ? [address] : undefined,
  });

  const { data: tokenBalance } = useReadContract({
    ...wagmiERC20MockConfig,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  console.log("balance", balance);

  const withdrawTokens = (amount: bigint) => {
    writeWithdraw({
      ...wagmiContractConfig,
      functionName: "withdraw",
      args: [amount],
    });
  };

  const approveTokens = async (amount: string) => {
    await writeApprove({
      ...wagmiERC20MockConfig, // Changed to use ERC20 config instead of contract config
      functionName: "approve",
      args: [wagmiContractConfig.address, parseEther(amount)],
    });
  };

  const depositTokens = async (amount: bigint) => {
    await writeDeposit({
      ...wagmiContractConfig,
      functionName: "depositTokens",
      args: [amount],
    });
  };

  // Watch token deposit events
  useWatchContractEvent({
    ...wagmiContractConfig,
    config: wagmiConfig,
    eventName: "TokensDeposited",
    onLogs(logs) {
      console.log("Tokens deposited:", logs);
    },
  });

  // Watch token received events
  useWatchContractEvent({
    ...wagmiContractConfig,
    config: wagmiConfig,
    eventName: "TokensReceived",
    onLogs(logs) {
      console.log("Tokens received:", logs);
    },
  });

  // Watch withdraw events
  useWatchContractEvent({
    ...wagmiContractConfig,
    config: wagmiConfig,
    eventName: "Withdraw",
    onLogs(logs) {
      console.log("Tokens withdrawn:", logs);
    },
  });

  return {
    withdrawHash,
    approveHash,
    depositHash,
    allowance,
    balance,
    tokenBalance,
    withdrawTokens,
    approveTokens,
    depositTokens,
  };
}
