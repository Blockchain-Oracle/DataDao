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
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { Loader2, Info, AlertCircle } from "lucide-react";
import { useTokenOperations } from "@/hooks/useTokenOperations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useWatchContractEvent } from "wagmi";
import { wagmiContractConfig } from "@/lib/constant";
import { wagmiERC20MockConfig } from "@/lib/constant";
interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const { allowance, balance, approveTokens, depositTokens, tokenBalance, mintTokens } =
    useTokenOperations(address);

  // Watch approval events
  useWatchContractEvent({
    ...wagmiERC20MockConfig,
    eventName: "Approval",
    // fromBlock: BigInt(40),
    onLogs() {
      toast({
        title: "Approval successful",
        description: "You can now deposit your tokens",
      });
      setIsApproving(false);
    },
  });

  // Watch deposit events
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "TokensDeposited",
    onLogs() {
      toast({
        title: "Deposit successful",
        description: `Successfully deposited ${amount} tokens`,
      });
      onClose();
      setAmount("");
      setIsDepositing(false);
    },
  });

  // Watch mint events
  useWatchContractEvent({
    ...wagmiERC20MockConfig,
    eventName: "Transfer",
    onLogs(logs) {
      const [log] = logs;
      console.log(logs);
      if (log.args.to === address) {  // Only handle mints to current user
        toast({
          title: "Minting successful",
          description: `Successfully minted ${amount} tokens to your wallet`,
        });
        setIsMinting(false);
      }
    },
  });

  const handleApprove = async () => {
    if (!amount) return;

    try {
      setIsApproving(true);
      await approveTokens(amount);

      toast({
        title: "Approval initiated",
        description: "Approving tokens for deposit...",
      });
    } catch (error) {
      toast({
        title: "Approval failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsApproving(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount) return;

    try {
      setIsDepositing(true);
      await depositTokens(parseEther(amount));

      toast({
        title: "Deposit initiated",
        description: `Depositing ${amount} tokens`,
      });
    } catch (error) {
      toast({
        title: "Deposit failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsDepositing(false);
    }
  };

  const handleMint = async () => {
    if (!amount) return;

    try {
      setIsMinting(true);
      await mintTokens(amount);

      toast({
        title: "Minting initiated",
        description: `Minting ${amount} tokens to your wallet...`,
      });
    } catch (error) {
      toast({
        title: "Minting failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsMinting(false);
    }
  };

  const needsApproval =
    amount && allowance !== undefined ? parseEther(amount) > allowance : false;

  const formattedBalance = balance ? formatEther(balance as bigint) : "0";
  const formattedAllowance = allowance ? formatEther(allowance as bigint) : "0";
  const formattedTokenBalance = tokenBalance ? formatEther(tokenBalance as bigint) : "0";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Deposit Tokens
          </DialogTitle>
          <DialogDescription className="text-base">
            Deposit tokens to create tasks and distribute rewards
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount" className="text-base font-semibold">
              Amount to Deposit
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to deposit"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Wallet Balance
                </span>
                <span className="font-mono font-medium">
                  {formattedTokenBalance} tokens
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Contract Balance
                </span>
                <span className="font-mono font-medium">
                  {formattedBalance} tokens
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Current Allowance
                </span>
                <span className="font-mono font-medium">
                  {formattedAllowance} tokens
                </span>
              </div>
            </div>

            {needsApproval && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need to approve the contract to spend your tokens before
                  depositing
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {parseFloat(formattedTokenBalance) === 0 ? (
            <Button 
              onClick={handleMint} 
              disabled={isMinting || !amount || parseFloat(amount) <= 0}
              className="min-w-[120px]"
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                "Mint Tokens"
              )}
            </Button>
          ) : needsApproval ? (
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Tokens"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleDeposit}
              disabled={isDepositing || !amount || parseFloat(amount) <= 0}
              className="min-w-[120px]"
            >
              {isDepositing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Depositing...
                </>
              ) : (
                "Deposit"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
