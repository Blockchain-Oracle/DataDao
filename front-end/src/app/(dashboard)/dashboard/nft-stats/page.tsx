"use client";

import { useNFTPerformance } from "@/hooks/useNFTPerformance";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Trophy, Target, Zap } from "lucide-react";
import Image from "next/image";
import { LoadingState } from "@/components/ui/loading-state";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

export default function NFTStatsPage() {
  const { address } = useAccount();
  const { performanceData, isLoading, error, progressToNextLevel, thresholds } = useNFTPerformance(address);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Connect Wallet</h2>
        <p className="text-muted-foreground">Please connect your wallet to view your NFT stats</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading NFT data: {error.message}
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">No NFT Found</h2>
        <p className="text-muted-foreground">Start participating in tasks to earn your first NFT!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">NFT Performance Stats</h1>
        <p className="text-muted-foreground">
          Track your NFT evolution progress and achievements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* NFT Preview Card */}
        <Card className="md:row-span-2">
          <CardHeader>
            <CardTitle>Your NFT</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div 
              className="relative w-64 h-64 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              {performanceData.tokenId && (
                <Image
                  src={`/api/nft/${performanceData.levelTitle}/${performanceData.tokenId}/image`}
                  alt="NFT"
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                />
              )}
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">{performanceData.levelTitle} Level</h3>
              <p className="text-sm text-muted-foreground">
                Token ID: #{performanceData.tokenId?.toString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Evolution Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Next Level</span>
                <span>{progressToNextLevel}%</span>
              </div>
              <Progress value={progressToNextLevel} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Current Level</span>
                <p className="text-2xl font-bold">{performanceData.currentLevel}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Tasks Required</span>
                <p className="text-2xl font-bold">{thresholds.MASTER_THRESHOLD.toString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-xl font-bold">{performanceData.tasksCompleted.toString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Average Quality Score</p>
                  <p className="text-xl font-bold">{performanceData.averageQualityScore.toString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Target className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                  <p className="text-xl font-bold">{performanceData.highestQualityScore.toString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Consecutive High Scores</p>
                  <p className="text-xl font-bold">{performanceData.consecutiveHighScores.toString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl">
          {performanceData.tokenId && (
            <div className="relative aspect-video">
              <Image
                src={`/api/nft/${performanceData.levelTitle}/${performanceData.tokenId}/image`}
                alt="NFT"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 75vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
