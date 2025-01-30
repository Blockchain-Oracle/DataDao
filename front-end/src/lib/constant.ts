import { Address } from "viem";
import { abi as DataLabelingPlatformABI } from "./abi/DataLabelingPlatform.json";
import { abi as ERC20MockABI } from "./abi/ERC20Mock.json";
if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set");
}

export const contractAddress = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

console.log(contractAddress);
export const wagmiContractConfig = {
  address: contractAddress,
  abi: DataLabelingPlatformABI,
} as const;

export const wagmiERC20MockConfig = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
  abi: ERC20MockABI,
} as const;
export const LOCAL_RPC_URL = "http://127.0.0.1:8545";
