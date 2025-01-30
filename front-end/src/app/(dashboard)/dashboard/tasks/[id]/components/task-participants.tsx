import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AlertCircle } from "lucide-react";
import { Address } from "viem";
import { shortenAddress } from "@/lib/utils";

interface TaskParticipantsProps {
  participants: Address[];
}

export function TaskParticipants({ participants }: TaskParticipantsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants</CardTitle>
        <CardDescription>
          {participants.length}{" "}
          {participants.length === 1 ? "person" : "people"} joined this task
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participants.map((participant, index) => (
            <div
              key={participant}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {participant.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {shortenAddress(participant)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Participant #{index + 1}
                  </p>
                </div>
              </div>
              <HoverCard>
                <HoverCardTrigger>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </HoverCardTrigger>
                <HoverCardContent>
                  View participant&apos;s history and reputation
                </HoverCardContent>
              </HoverCard>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
