import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLogProps {
  logs: Array<{
    event: string;
    type: string;
    timestamp: number;
    amount?: string;
    taskId?: number;
  }>;
  isLoading: boolean;
}

export function ActivityLog({ logs, isLoading }: ActivityLogProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!logs?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recent activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{log.event}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
                {log.amount && (
                  <p className="text-xs font-medium">{log.amount} tokens</p>
                )}
                {log.taskId && (
                  <p className="text-xs">Task ID: {log.taskId}</p>
                )}
              </div>
              <Badge variant={getBadgeVariant(log.type)}>{log.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getBadgeVariant(type: string): "default" | "secondary" | "destructive" {
  switch (type) {
    case "DEPOSIT":
      return "default";
    case "WITHDRAWAL":
      return "destructive";
    default:
      return "secondary";
  }
}
