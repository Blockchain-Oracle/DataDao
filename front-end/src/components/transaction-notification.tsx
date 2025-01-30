import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface TransactionNotificationProps {
  hash: string;
  status: "pending" | "success" | "error";
  message: string;
}

export function TransactionNotification({
  hash,
  status,
  message,
}: TransactionNotificationProps) {
  const statusIcons = {
    pending: <Loader2 className="h-4 w-4 animate-spin" />,
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <XCircle className="h-4 w-4 text-destructive" />,
  };

  return (
    <div className="flex items-center gap-2">
      {statusIcons[status]}
      <div className="grid gap-1">
        <p className="text-sm font-medium">{message}</p>
        {hash && (
          <a
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:underline"
          >
            View on Etherscan
          </a>
        )}
      </div>
    </div>
  );
}
