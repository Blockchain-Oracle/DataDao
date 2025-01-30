import { useReadContract } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";

export function useContractConstants() {
  const { data: tokenAddress } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTokenAddress",
  });

  const { data: taskDeadlineBuffer } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTaskDeadlineBuffer",
  });

  return {
    tokenAddress,
    taskDeadlineBuffer,
  };
}
