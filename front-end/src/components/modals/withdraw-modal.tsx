"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { parseEther, formatEther } from "viem";
import { Loader2 } from "lucide-react";
import { useWriteContract, useWatchContractEvent } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: bigint;
}

export function WithdrawModal({
  isOpen,
  onClose,
  balance,
}: WithdrawModalProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Contract write function
  const { writeContract: writeWithdraw } = useWriteContract();

  // Watch withdraw events
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "Withdraw",
    onLogs(logs) {
      toast({
        title: "Withdrawal successful",
        description: `Successfully withdrew ${amount} tokens`,
      });
      onClose();
      setAmount("");
      setIsWithdrawing(false);
    },
  });

  const handleWithdraw = async () => {
    if (!amount) return;

    try {
      const withdrawAmount = parseEther(amount);

      // Check if withdrawal amount is greater than balance
      if (withdrawAmount > balance) {
        toast({
          title: "Insufficient balance",
          description: "You cannot withdraw more than your available balance",
          variant: "destructive",
        });
        return;
      }

      setIsWithdrawing(true);
      await writeWithdraw({
        ...wagmiContractConfig,
        functionName: "withdraw",
        args: [withdrawAmount],
      });

      toast({
        title: "Withdrawal initiated",
        description: `Withdrawing ${amount} tokens`,
      });
    } catch (error) {
      toast({
        title: "Withdrawal failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsWithdrawing(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(formatEther(balance));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw Tokens</DialogTitle>
          <DialogDescription>
            Withdraw your tokens from the platform to your wallet
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <button
                onClick={handleMaxClick}
                className="text-xs text-primary hover:underline"
              >
                Max: {formatEther(balance)} tokens
              </button>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to withdraw"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={formatEther(balance)}
            />
            {parseFloat(amount) > parseFloat(formatEther(balance)) && (
              <p className="text-sm text-destructive">
                Amount exceeds available balance
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleWithdraw} disabled={isWithdrawing || !amount}>
            {isWithdrawing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              "Withdraw"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
