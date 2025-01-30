"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowRight, Clock, Coins, Users, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAllTasks } from "@/hooks/useTaskDetails";
import { CountdownTimer } from "@/components/countdown-timer";
import { formatEther } from "viem";

export default function Home() {
  const { isConnected } = useAccount();
  const { tasks, isLoading, error, hasMore, loadMoreRef } = useAllTasks();

  return (
    <>
      <section className="relative space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-background blur-3xl"></div>
        <div className="container relative z-10 flex max-w-[64rem] flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-background/60 backdrop-blur-xl">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
              Decentralized Data Labeling Platform
            </span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-primary via-violet-500 to-secondary bg-clip-text text-transparent">
              Get Paid for Data Labeling
            </span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Join thousands of data labelers earning money by completing simple
            tasks. Connect your account to start earning today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button
                  size="lg"
                  onClick={
                    isConnected
                      ? () => (window.location.href = "/tasks/browse")
                      : openConnectModal
                  }
                  className="w-full sm:w-auto relative group overflow-hidden bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {isConnected ? "Explore Tasks" : "Connect Wallet"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </ConnectButton.Custom>
            <Link href="/tasks/browse">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-primary/20 hover:bg-primary/10"
              >
                Browse Tasks
                <Coins className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container space-y-8 py-8 md:py-12 lg:py-24">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Featured Tasks
              </span>
            </h2>
            <p className="text-muted-foreground text-center sm:text-left">
              Top paying opportunities available now
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            View All Tasks <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {tasks?.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                  {!isConnected && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="text-center space-y-4 p-4">
                        <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
                        <ConnectButton />
                      </div>
                    </div>
                  )}
                  <CardHeader className="flex-none">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:items-center">
                      <CardTitle className="text-lg sm:text-xl font-bold">
                        {task.metadata?.title || `Task #${index}`}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/10">
                        {task.rewardsDistributed ? "Completed" : "Active"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created by {task.creator.slice(0, 6)}...
                      {task.creator.slice(-4)}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-primary" />
                          <span className="font-bold">
                            {formatEther(task.totalReward)} ETH
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <CountdownTimer
                            deadline={task.deadline}
                            className="font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {task.participants?.length || 0} participants
                        </span>
                      </div>
                      {task.metadata?.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.metadata.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-none">
                    <Link href={`/dashboard/tasks/${index}`} className="w-full">
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                        View Details
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <div className="col-span-full flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="col-span-full text-center text-red-500">
              {error.message}
            </div>
          )}

          {/* Infinite scroll trigger */}
          {hasMore && <div ref={loadMoreRef} className="h-10" />}
        </div>
      </section>
    </>
  );
}
