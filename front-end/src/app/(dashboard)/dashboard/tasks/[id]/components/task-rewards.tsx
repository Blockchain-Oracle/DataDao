import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RewardsList } from "./rewards-list";
import { useTaskDetails } from "@/hooks/useTaskDetails";
import { useRewards } from "@/hooks/useRewards";
import { TaskReward } from "@/types/rewards";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

interface TaskRewardsProps {
  taskId: number;
  isCreator: boolean;
}

export function TaskRewards({ taskId, isCreator }: TaskRewardsProps) {
  const { address } = useAccount();
  const { task } = useTaskDetails(taskId);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "pending" | "claimable" | "claimed"
  >("pending");

  const { claimableReward, claimReward, participatedTasks } = useRewards(
    address!
  );

  const handleClaimReward = async () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      await claimReward();
      toast({
        title: "Reward claimed successfully",
        description: "Your rewards have been sent to your wallet",
      });
    } catch (error) {
      toast({
        title: "Failed to claim reward",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Create reward objects based on contract data
  const rewards: TaskReward[] = task
    ? [
        {
          taskId,
          amount: claimableReward || BigInt(0),
          deadline: Number(task.deadline),
          status: task.rewardsDistributed ? "claimable" : "pending",
          tokenAddress: task.tokenAddress,
          metadata: {
            title: task.metadata?.title,
            description: task.metadata?.description,
          },
        },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Rewards</CardTitle>
        <CardDescription>
          {isCreator
            ? "Manage and distribute rewards for this task"
            : "Track your rewards for this task"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="pending"
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="claimable">
              Claimable {claimableReward && claimableReward > 0 ? "🟢" : ""}
            </TabsTrigger>
            <TabsTrigger value="claimed">Claimed</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <RewardsList
              rewards={rewards.filter((r) => r.status === "pending")}
              onClaim={handleClaimReward}
              isProcessing={isProcessing}
            />
          </TabsContent>
          <TabsContent value="claimable">
            <RewardsList
              rewards={rewards.filter((r) => r.status === "claimable")}
              onClaim={handleClaimReward}
              isProcessing={isProcessing}
            />
          </TabsContent>
          <TabsContent value="claimed">
            <RewardsList
              rewards={rewards.filter((r) => r.status === "claimed")}
              onClaim={handleClaimReward}
              isProcessing={isProcessing}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
