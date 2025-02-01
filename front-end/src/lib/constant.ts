import { Address } from "viem";
import { abi as DataLabelingPlatformABI } from "./abi/DataLabelingPlatform.json";
import { abi as ERC20MockABI } from "./abi/ERC20Mock.json";
import { abi as PerformanceNFTABI } from "./abi/PerformanceNFT.json";

if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set");
}

if (!process.env.NEXT_PUBLIC_TOKEN_ADDRESS) {
  throw new Error("NEXT_PUBLIC_TOKEN_ADDRESS is not set");
}

if (!process.env.NEXT_PUBLIC_NFT_ADDRESS) {
  throw new Error("NEXT_PUBLIC_NFT_ADDRESS is not set");
}

export const contractAddress = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

export const wagmiContractConfig = {
  address: contractAddress,
  abi: DataLabelingPlatformABI,
} as const;

export const wagmiERC20MockConfig = {
  address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address,
  abi: ERC20MockABI,
} as const;

export const LOCAL_RPC_URL = "http://127.0.0.1:8545";

export const performanceNftConfig = {
  address: process.env.NEXT_PUBLIC_NFT_ADDRESS as Address,
  abi: PerformanceNFTABI,
} as const;
