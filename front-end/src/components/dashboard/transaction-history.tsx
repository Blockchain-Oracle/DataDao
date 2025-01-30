"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchContractEvent } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { formatEther } from "viem";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, ArrowUpRight } from "lucide-react";

interface Transaction {
  type: "deposit" | "withdraw" | "claim";
  amount: string;
  timestamp: number;
  hash: string;
}

export function TransactionHistory({ address }: { address: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Watch for deposits
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "TokensDeposited",
    onLogs(logs) {
      const newTx = logs
        .filter(
          (log: any) => log.args?.user?.toLowerCase() === address.toLowerCase()
        )
        .map((log: any) => ({
          type: "deposit",
          amount: formatEther(log.args.amount as bigint),
          timestamp: Date.now(),
          hash: log.transactionHash || "",
        }));
      if (newTx.length > 0) {
        setTransactions((prev) => [...newTx, ...prev]);
      }
    },
  });

  // Watch for withdrawals
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "Withdraw",
    onLogs(logs) {
      const newTx = logs
        .filter(
          (log: any) => log.args?.user?.toLowerCase() === address.toLowerCase()
        )
        .map((log: any) => ({
          type: "withdraw",
          amount: formatEther(log.args.amount as bigint),
          timestamp: Date.now(),
          hash: log.transactionHash || "",
        }));
      if (newTx.length > 0) {
        setTransactions((prev) => [...newTx, ...prev]);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full">
          {transactions.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div className="flex items-center gap-2">
                    {tx.type === "deposit" ? (
                      <ArrowDownUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{tx.amount} tokens</p>
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
