import { defineChain } from "viem";

export const tarus = /*#__PURE__*/ defineChain({
  id: 490_000,
  name: "Autonomys EVM",
  nativeCurrency: { name: "Autonomys", symbol: "tAI3", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://auto-evm.taurus.autonomys.xyz/ws",
        "https://auto-evm-0.taurus.subspace.network/ws",
      ],
      webSocket: ["wss://auto-evm.taurus.autonomys.xyz/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://blockscout.taurus.autonomys.xyz",
    },
  },
  testnet: true,
});
