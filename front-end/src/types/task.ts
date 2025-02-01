export interface TaskMetadata {
  title: string;
  description: string;
  images: {
    cid: string; // autoDriveCID hash for each image
    label?: string; // Optional label for the image
    url?: string; // Optional URL for the image
  }[];
  options: string[]; // Possible answers/labels
  creator: `0x${string}`; // Ethereum address of creator
  totalReward: bigint; // Total reward amount in tokens
  deadline: number; // Unix timestamp
  tokenAddress: `0x${string}`; // ERC20 token address
  createdAt: number; // Timestamp when metadata was created
}

export interface Task {
  autoDriveCid: string;
  creator: `0x${string}`;
  totalReward: bigint;
  deadline: number;
  rewardsDistributed: boolean;
  tokenAddress: `0x${string}`;
  participants: `0x${string}`[];
}
