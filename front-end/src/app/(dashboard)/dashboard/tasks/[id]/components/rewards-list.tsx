import { TaskReward } from "@/types/rewards";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RewardsListProps {
  rewards: TaskReward[];
  onClaim: (taskId: number) => Promise<void>;
  isProcessing: boolean;
}

export function RewardsList({
  rewards,
  onClaim,
  isProcessing,
}: RewardsListProps) {
  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No rewards found in this category
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rewards.map((reward) => (
        <RewardItem
          key={`${reward.taskId}-${reward.status}`}
          reward={reward}
          onClaim={onClaim}
          isProcessing={isProcessing}
        />
      ))}
    </div>
  );
}

interface RewardItemProps {
  reward: TaskReward;
  onClaim: (taskId: number) => Promise<void>;
  isProcessing: boolean;
}

function RewardItem({ reward, onClaim, isProcessing }: RewardItemProps) {
  const now = Date.now() / 1000;
  const deadline = reward.deadline;
  const progress = Math.min(((now - deadline) / deadline) * 100, 100);
  const timeLeft = formatDistanceToNow(deadline * 1000, { addSuffix: true });

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">
            {reward.metadata?.title || `Task #${reward.taskId}`}
          </h4>
          <p className="text-sm text-muted-foreground">
            {reward.metadata?.description || "No description available"}
          </p>
        </div>
        <RewardStatusBadge status={reward.status} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Time Remaining</span>
          </div>
          <span>{timeLeft}</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4" />
          <span className="font-medium">
            {formatEther(reward.amount)} tokens
          </span>
        </div>
        {reward.status === "claimable" && (
          <Button
            onClick={() => onClaim(reward.taskId)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              "Claim Reward"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function RewardStatusBadge({ status }: { status: TaskReward["status"] }) {
  const variants = {
    pending: "bg-yellow-100 text-yellow-800",
    claimable: "bg-green-100 text-green-800",
    claimed: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
