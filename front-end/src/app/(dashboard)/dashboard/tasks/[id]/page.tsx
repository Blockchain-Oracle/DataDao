"use client";

import { useTaskDetails } from "@/hooks/useTaskDetails";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TaskHeader } from "./components/task-header";
import { TaskDetails } from "./components/task-details";
import { TaskParticipants } from "./components/task-participants";
import { TaskImages } from "./components/task-images";
import { TaskDetailsSkeleton } from "./components/task-skeleton";
import { TaskRewards } from "./components/task-rewards";

export default function TaskPage({ params }: { params: { id: string } }) {
  const taskId = parseInt(params.id);
  const { task, isLoading, error, actions } = useTaskDetails(taskId);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !task) {
    return <TaskDetailsSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <TaskHeader task={task} actions={actions} />

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 space-y-8">
          <TaskDetails task={task} />
          <TaskImages images={task.metadata?.images || []} />
          <TaskRewards taskId={task.id} isCreator={task.isUserCreator} />
        </div>

        <div className="md:col-span-4">
          <TaskParticipants participants={task.participants || []} />
        </div>
      </div>
    </div>
  );
}
