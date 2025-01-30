// app/api/tasks/routes.ts

import { createPublicClient, http } from "viem";
import { NextResponse } from "next/server";
import { wagmiContractConfig } from "@/lib/constant";
import { LOCAL_RPC_URL } from "@/lib/constant";
import { Task } from "@/types/task";

const CONTRACT_ADDRESS = wagmiContractConfig.address as `0x${string}`;
const RPC_URL = LOCAL_RPC_URL;
const abi = wagmiContractConfig.abi;

// GET /api/tasks
// Returns all tasks with their details
export async function GET() {
  try {
    const client = createPublicClient({
      transport: http(RPC_URL),
    });

    // Get total number of tasks
    const taskCount = (await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "getTaskIdCounter",
    })) as bigint;

    console.log("taskCount", taskCount);
    // Fetch all tasks
    const tasks = [];
    for (let i = 0; i < taskCount; i++) {
      const task = (await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: "getTaskIdToTask",
        args: [BigInt(i)],
      })) as Task;

      // Format task data
      const formattedTask = {
        creator: task.creator,
        totalReward: task.totalReward.toString(),
        deadline: task.deadline.toString(),
        rewardsDistributed: task.rewardsDistributed,
        tokenAddress: task.tokenAddress,
        participants: task.participants,
        autoDriveCid: task.autoDriveCid,
      };

      tasks.push(formattedTask);
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// // POST /api/tasks/create
// // Creates a new task
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { autoDriveCid, totalReward, deadline, tokenAddress } = body;

//     const provider = new ethers.JsonRpcProvider(RPC_URL);
//     const signer = await provider.getSigner();
//     const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

//     const tx = await contract.createTask(
//       autoDriveCid,
//       totalReward,
//       deadline,
//       tokenAddress
//     );
//     await tx.wait();

//     return NextResponse.json({ success: true, txHash: tx.hash });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to create task" },
//       { status: 500 }
//     );
//   }
// }
