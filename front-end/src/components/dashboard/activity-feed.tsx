"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchContractEvent } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { useState } from "react";

interface ActivityItem {
  type:
    | "task_created"
    | "task_performed"
    | "rewards_distributed"
    | "reward_claimed";
  description: string;
  timestamp: number;
  taskId: number;
}

export function ActivityFeed({ address }: { address: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Watch for task creation
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "TaskCreated",
    onLogs(logs) {
      const newActivities = logs
        .filter((log) => log.args.creator === address)
        .map((log) => ({
          type: "task_created",
          description: `Created task #${log.args.taskId}`,
          timestamp: Date.now(),
          taskId: Number(log.args.taskId),
        }));
      setActivities((prev) => [...newActivities, ...prev]);
    },
  });

  // Watch for task participation
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "TaskPerformed",
    onLogs(logs) {
      const newActivities = logs
        .filter((log) => log.args.participant === address)
        .map((log) => ({
          type: "task_performed",
          description: `Participated in task #${log.args.taskId}`,
          timestamp: Date.now(),
          taskId: Number(log.args.taskId),
        }));
      setActivities((prev) => [...newActivities, ...prev]);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full">
          {activities.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {activity.type.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
