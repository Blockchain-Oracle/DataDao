import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEther } from "viem";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Award } from "lucide-react";

interface TransactionHistoryProps {
  events: {
    type: "deposit" | "withdraw" | "claim";
    amount: bigint;
    timestamp: number;
    txHash: string;
  }[];
}

export function TransactionHistory({ events }: TransactionHistoryProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />;
      case "withdraw":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "claim":
        return <Award className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No transactions yet
            </p>
          ) : (
            events.map((event, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  {getEventIcon(event.type)}
                  <div>
                    <p className="font-medium capitalize">{event.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(event.timestamp, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatEther(event.amount)} tokens
                  </p>
                  <a
                    href={`https://etherscan.io/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View transaction
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
