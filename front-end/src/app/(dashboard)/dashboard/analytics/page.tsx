"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { useAnalytics, TimeFrame } from "@/hooks/useAnalytics";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Award, Users, CheckCircle, Coins } from "lucide-react";
import { useState } from "react";

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeFrame>("week");
  const { data, isLoading, error } = useAnalytics(timeframe);

  if (isLoading || !data) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading analytics: {error.message}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Tasks",
      value: data.totalTasks,
      icon: CheckCircle,
      description: `${data.activeTasks} active, ${data.completedTasks} completed`,
    },
    {
      title: "Total Rewards",
      value: `${data.totalRewardsDistributed} tokens`,
      icon: Coins,
      description: `${data.averageRewardPerTask} tokens avg per task`,
    },
    {
      title: "Avg. Participation",
      value: data.averageParticipation.toFixed(1),
      icon: Users,
      description: "participants per task",
    },
    {
      title: "Completion Rate",
      value: `${(data.completionRate * 100).toFixed(1)}%`,
      icon: Award,
      description: "tasks completed successfully",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Task performance and platform statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Activity</CardTitle>
            <Tabs
              value={timeframe}
              onValueChange={(v) => setTimeframe(v as typeof timeframe)}
            >
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={Object.entries(data.tasksByDate).map(([date, value]) => ({
                  date,
                  tasks: value,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Participation Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(data.participationByDate).map(
                    ([date, value]) => ({
                      date,
                      participants: value,
                    })
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="participants" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(data.rewardsByDate).map(
                    ([date, value]) => ({
                      date,
                      rewards: value,
                    })
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rewards" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
