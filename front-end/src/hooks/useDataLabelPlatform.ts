// hooks/useDataLabelPlatform.ts
import { useWriteContract } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";

export function useDataLabelPlatform() {
  // Write Functions
  const { data: createTaskHash, writeContract: writeCreateTask } =
    useWriteContract();
  const { data: participateHash, writeContract: writeParticipate } =
    useWriteContract();
  const { data: distributeHash, writeContract: writeDistribute } =
    useWriteContract();

  const createTask = (
    autoDriveCID: string,
    totalReward: bigint,
    deadline: bigint
  ) => {
    writeCreateTask({
      ...wagmiContractConfig,
      functionName: "createTask",
      args: [autoDriveCID, totalReward, deadline],
    });
  };

  const participateInTask = (taskId: number) => {
    writeParticipate({
      ...wagmiContractConfig,
      functionName: "performTask",
      args: [taskId],
    });
  };

  const distributeRewards = (taskId: number) => {
    writeDistribute({
      ...wagmiContractConfig,
      functionName: "distributeRewards",
      args: [taskId],
    });
  };

  return {
    createTaskHash,
    participateHash,
    distributeHash,
    createTask,
    participateInTask,
    distributeRewards,
  };
}
