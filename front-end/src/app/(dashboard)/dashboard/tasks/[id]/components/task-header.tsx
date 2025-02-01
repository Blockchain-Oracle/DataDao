import { Button } from "@/components/ui/button";
import { Share2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { TaskDetails } from "@/hooks/useTaskDetails";
import { useWatchContractEvent } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { useRouter } from "next/navigation";

interface TaskHeaderProps {
  task: TaskDetails;
  actions: {
    participateInTask: () => Promise<void>;
    distributeRewards: () => Promise<void>;
  };
}

export function TaskHeader({ task, actions }: TaskHeaderProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isParticipating, setIsParticipating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  // Watch for RewardsDistributed events
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "RewardsDistributed",
    onLogs() {
      setIsDistributing(false);
      toast({
        title: "Rewards distributed",
        description: "Successfully distributed rewards to participants",
      });
      router.refresh();
    },
  });

  const handleParticipate = async () => {
    if (!task.isUserParticipant && !isParticipating) {
      try {
        setIsParticipating(true);
        await actions.participateInTask();
        toast({
          title: "Successfully joined task",
          description: "You are now a participant in this task",
        });
        router.refresh();
      } catch (err) {
        toast({
          title: "Failed to join task",
          description: err instanceof Error ? err.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsParticipating(false);
      }
    }
  };

  const handleDistribute = async () => {
    if (!isDistributing) {
      try {
        setIsDistributing(true);
        await actions.distributeRewards();
        toast({
          title: "Distribution initiated",
          description: "Distributing rewards to participants...",
        });
        router.refresh();
      } catch (err) {
        toast({
          title: "Failed to distribute rewards",
          description: err instanceof Error ? err.message : "Please try again",
          variant: "destructive",
        });
        setIsDistributing(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {task.metadata?.title || `Task #${task.id}`}
        </h1>
        <p className="text-muted-foreground mt-1">Created by {task.creator}</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast({
              title: "Link copied",
              description: "Task link copied to clipboard",
            });
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.open(`/task/${task.id}`, "_blank")}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        {task.status === "completed" && (
          <Button
            onClick={handleDistribute}
            disabled={isDistributing}
            className="min-w-[120px]"
          >
            {isDistributing ? "Distributing..." : "Distribute"}
          </Button>
        )}
        <Button
          onClick={handleParticipate}
          disabled={
            task.isUserParticipant || isParticipating || task.isUserCreator
          }
          className="min-w-[120px]"
        >
          {isParticipating
            ? "Joining..."
            : task.isUserCreator
            ? "Owner"
            : task.status === "completed"
            ? "Completed"
            : task.status === "expired"
            ? "Expired"
            : "Participate"}
        </Button>
      </div>
    </div>
  );
}
