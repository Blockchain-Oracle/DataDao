"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Clock, Coins } from "lucide-react";
import { useRewards } from "@/hooks/useRewards";
import { useAccount } from "wagmi";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatEther } from "viem";
import { RewardsList } from "../tasks/[id]/components/rewards-list";
import { TaskReward } from "@/types/rewards";
import { wagmiContractConfig } from "@/lib/constant";

export default function RewardsPage() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isClaimingAll, setIsClaimingAll] = useState(false);

  // Use the rewards hook for all tasks
  const { claimableReward, claimReward, isLoading } = useRewards(address!);

  // Create reward object based on contract data
  const rewards: TaskReward[] = claimableReward
    ? [
        {
          taskId: 0,
          amount: BigInt(claimableReward || 0),
          deadline: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
          status: "claimable",
          tokenAddress: wagmiContractConfig.address,
        },
      ]
    : [];

  const handleClaimAll = async () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsClaimingAll(true);
      await claimReward();
      toast({
        title: "Rewards claimed successfully",
        description: "All available rewards have been sent to your wallet",
      });
    } catch (error) {
      toast({
        title: "Failed to claim rewards",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsClaimingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
          <p className="text-muted-foreground">
            Manage and claim your earned rewards
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEther(BigInt(claimableReward || 0))} tokens
            </div>
            <p className="text-xs text-muted-foreground">
              Total rewards earned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available to Claim
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEther(BigInt(claimableReward || 0))} tokens
            </div>
            <p className="text-xs text-muted-foreground">Ready to be claimed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Rewards
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 tokens</div>
            <p className="text-xs text-muted-foreground">From active tasks</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Available to Claim</TabsTrigger>
          <TabsTrigger value="pending">Pending Rewards</TabsTrigger>
          <TabsTrigger value="claimed">Claim History</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <RewardsList
            rewards={rewards}
            onClaim={handleClaimAll}
            isProcessing={isClaimingAll || isLoading}
          />
        </TabsContent>

        <TabsContent value="pending">
          <RewardsList
            rewards={[]}
            onClaim={handleClaimAll}
            isProcessing={isClaimingAll || isLoading}
          />
        </TabsContent>

        <TabsContent value="claimed">
          <RewardsList
            rewards={[]}
            onClaim={handleClaimAll}
            isProcessing={isClaimingAll || isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
