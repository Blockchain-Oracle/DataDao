import { Address } from "viem";
import { abi as DataLabelingPlatformABI } from "./abi/DataLabelingPlatform.json";
import { abi as ERC20MockABI } from "./abi/ERC20Mock.json";
import { abi as PerformanceNFTABI } from "./abi/PerformanceNFT.json";
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


//taurs mainnet ERC20Mocktoken 0xF3A7b4Bc6F72f2490dA7b9BCd8CE6b34A1A6335c
export const wagmiERC20MockConfig = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
  abi: ERC20MockABI,
} as const;
export const LOCAL_RPC_URL = "http://127.0.0.1:8545";

//taurs mainnet PerformanceNFT 0xEd51ca2ebB382E6f28aCc011C13b516D458671C3
export const performanceNftConfig = {
  address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as Address,
  abi: PerformanceNFTABI,
} as const;
