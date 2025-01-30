"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Activity, Database, Award } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTask } from "@/hooks/useTask";
import { useRewards } from "@/hooks/useRewards";
import { formatEther } from "viem";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WithdrawModal } from "@/components/modals/withdraw-modal";
import { useState } from "react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  // Get all task-related data
  const {
    taskCount,
    userBalance = BigInt(0),
    tasksByCreator = [],
  } = useTask(0, address);

  // Get rewards data
  const { claimableReward = BigInt(0), participatedTasks = [] } = useRewards(
    address!
  );

  // Calculate total participations using tasksByParticipant
  const totalParticipations = participatedTasks.length;

  // Calculate active tasks (tasks created by user)
  const activeTasks = tasksByCreator.length;

  // Format balance with 4 decimal places
  const formatBalance = (value: bigint) => {
    const formatted = formatEther(value);
    const [whole, decimal] = formatted.split(".");
    return `${whole}${decimal ? `.${decimal.slice(0, 4)}` : ""}`;
  };

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to DataDAO
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Join our decentralized data labeling platform. Connect your wallet
            to start creating tasks, contributing data, and earning rewards.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <ConnectButton />
          <p className="text-xs text-muted-foreground">
            Secure blockchain connection required
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Track your contributions and manage your data labeling activities
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="web3-panel hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {formatBalance(userBalance)} tokens
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to withdraw
            </p>
          </CardContent>
        </Card>

        <Card className="web3-panel hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {activeTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tasks created</p>
          </CardContent>
        </Card>

        <Card className="web3-panel hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Data Contributions
            </CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {totalParticipations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card className="web3-panel hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Claimable Rewards
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {claimableReward ? formatBalance(claimableReward) : "0"} tokens
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available to claim
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/tasks" className="group">
          <Card className="web3-panel h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                Browse Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {taskCount
                  ? `${taskCount.toString()} available tasks`
                  : "Loading tasks..."}{" "}
                - Explore and participate in data labeling projects
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/my-tasks" className="group">
          <Card className="web3-panel h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                My Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {totalParticipations > 0
                  ? `${totalParticipations} submissions made`
                  : "Start contributing to earn rewards"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/created" className="group">
          <Card className="web3-panel h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:from-secondary group-hover:to-primary transition-all duration-300">
                Created Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {activeTasks > 0
                  ? `Manage your ${activeTasks} created tasks`
                  : "Create your first task"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* New Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TransactionHistory address={address!} />
        <ActivityFeed address={address!} />
      </div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        balance={userBalance}
      />
    </div>
  );
}
