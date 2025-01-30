import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Coins } from "lucide-react";
import { TaskDetails as TaskDetailsType } from "@/hooks/useTaskDetails";

interface TaskDetailsProps {
  task: TaskDetailsType;
}

export function TaskDetails({ task }: TaskDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Time Remaining</span>
            </div>
            <span className="text-sm font-medium">{task.timeLeft}</span>
          </div>
          <Progress value={task.progress} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Reward Pool</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              <span className="font-medium">{task.formattedReward} tokens</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Participants</span>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{task.participantCount}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <span className="text-sm font-medium">Task Description</span>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {task.metadata?.description || "No description provided"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
