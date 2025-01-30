import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface TaskPerformanceProps {
  taskId: number;
  participantCount: number;
  targetParticipants: number;
  completionRate: number;
  averageResponseTime: number;
  qualityScore: number;
}

export function TaskPerformance({
  taskId,
  participantCount,
  targetParticipants,
  completionRate,
  averageResponseTime,
  qualityScore,
}: TaskPerformanceProps) {
  const getQualityColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Task Performance #{taskId}</CardTitle>
          <Badge variant={completionRate >= 100 ? "default" : "secondary"}>
            {completionRate >= 100 ? "Completed" : "In Progress"}
          </Badge>
        </div>
        <CardDescription>
          Performance metrics and participation statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Participation Progress</span>
            <span>
              {participantCount}/{targetParticipants}
            </span>
          </div>
          <Progress
            value={(participantCount / targetParticipants) * 100}
            className="h-2"
          />
        </div>

        <div className="grid gap-4 grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Response Time</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Average time taken to complete the task
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-2xl font-bold">{averageResponseTime}m</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quality Score</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Based on validation and consensus
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{qualityScore}%</div>
              <div
                className={`h-3 w-3 rounded-full ${getQualityColor(
                  qualityScore
                )}`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
