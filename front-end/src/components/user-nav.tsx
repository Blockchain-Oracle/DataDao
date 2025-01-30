"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  Wallet,
  LogOut,
  ExternalLink,
  SwitchCamera,
} from "lucide-react";
import { useAccount, useDisconnect, useEnsName, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function UserNav() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });

  if (!isConnected) {
    return <ConnectButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src="/avatars/default.png" alt="User avatar" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
              {ensName?.slice(0, 2) || address?.slice(2, 4)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">
              {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Balance:{" "}
                {balance
                  ? `${Number(balance?.formatted).toFixed(4)} ${
                      balance?.symbol
                    }`
                  : "0"}
              </p>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Wallet className="mr-2 h-4 w-4" />
            Wallet
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ConnectButton.Custom>
          {({ openChainModal }) => (
            <DropdownMenuItem onClick={openChainModal}>
              <SwitchCamera className="mr-2 h-4 w-4" />
              Switch Network
            </DropdownMenuItem>
          )}
        </ConnectButton.Custom>
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
