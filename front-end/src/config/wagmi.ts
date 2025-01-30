import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from "wagmi/chains";
import { tarus } from "../lib/defination/tarus";
import { createConfig, http } from "@wagmi/core";
import { LOCAL_RPC_URL } from "@/lib/constant";

// Define local Anvil chain
export const localAnvil = {
  id: 31337,
  name: "Anvil Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  blockExplorers: {
    default: { name: "Local Explorer", url: "http://localhost:8545" },
  },
} as const;

// Rainbow Kit config
export const config = getDefaultConfig({
  appName: "TaskMarket",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [
    localAnvil, // Add local chain first
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    tarus,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [sepolia] : []),
  ],
  ssr: true,
});

// Wagmi config
export const wagmiConfig = createConfig({
  chains: [localAnvil, mainnet, sepolia, tarus],
  transports: {
    [localAnvil.id]: http(LOCAL_RPC_URL),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [tarus.id]: http(),
  },
});
