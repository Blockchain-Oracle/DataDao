"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={cn(
                      "relative inline-flex items-center px-6 py-2.5 rounded-xl",
                      "font-semibold text-sm text-white",
                      "bg-gradient-to-r from-primary to-secondary",
                      "hover:opacity-90 transition-all duration-300",
                      "shadow-lg shadow-primary/20",
                      "group overflow-hidden"
                    )}
                  >
                    <span className="relative z-10">Connect Wallet</span>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="relative inline-flex items-center px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-destructive hover:opacity-90 transition-all duration-300"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-4">
                  <button
                    onClick={openChainModal}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl",
                      "text-sm font-medium",
                      "bg-secondary/50 hover:bg-secondary",
                      "transition-colors duration-300"
                    )}
                  >
                    {chain.hasIcon && (
                      <div className="relative w-5 h-5">
                        {chain.iconUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="w-5 h-5"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl",
                      "text-sm font-medium",
                      "bg-secondary/50 hover:bg-secondary",
                      "transition-colors duration-300"
                    )}
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ""}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
