import { useReadContract, useWriteContract } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { Task, TaskMetadata } from "@/types/task";
import { wagmiContractConfig } from "@/lib/constant";
import { wagmiConfig } from "@/config/wagmi";
import { useInView } from "framer-motion";
import { readContract } from "wagmi/actions";
import { useAccount } from "wagmi";
import { formatDistanceToNow } from "date-fns";
import { formatEther } from "viem";

export interface TaskDetails extends Task {
  id: number;
  metadata: TaskMetadata | null;
  status: "active" | "completed" | "expired";
  timeLeft: string;
  progress: number;
  formattedReward: string;
  participantCount: number;
  isUserParticipant: boolean;
  isUserCreator: boolean;
}

export function useTaskDetails(taskId: number) {
  const [metadata, setMetadata] = useState<TaskMetadata | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { address } = useAccount();

  // Get on-chain data with better error handling
  const { data: task, isLoading: isTaskLoading } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTaskIdToTask",
    config: wagmiConfig,
    args: [taskId],
    onError: (err) => setError(err),
  });

  // Contract write functions
  const { writeContractAsync: writeParticipate } = useWriteContract();
  const { writeContractAsync: writeDistributeRewards } = useWriteContract();

  // Cast and enhance the task data
  const typedTask = task as Task;

  // Fetch metadata when we have the CID
  useEffect(() => {
    if (!typedTask?.autoDriveCid) return;

    const fetchMetadata = async () => {
      try {
        const response = await fetch(
          `/api/cid/metadata/${typedTask.autoDriveCid}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error("Metadata fetch error:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch metadata")
        );
      }
    };

    fetchMetadata();
  }, [typedTask?.autoDriveCid]);

  // Calculate task details
  const getEnhancedTaskDetails = (): TaskDetails | null => {
    if (!typedTask) return null;

    const now = Date.now() / 1000;
    const deadline = Number(typedTask.deadline);
    const timeLeft = formatDistanceToNow(deadline * 1000, { addSuffix: true });
    const progress = Math.min(((now - deadline) / deadline) * 100, 100);

    return {
      ...typedTask,
      id: taskId,
      metadata,
      status: getTaskStatus(typedTask),
      timeLeft,
      progress,
      formattedReward: formatEther(typedTask.totalReward),
      participantCount: typedTask.participants?.length || 0,
      isUserParticipant: address
        ? typedTask.participants?.includes(address)
        : false,
      isUserCreator: address === typedTask.creator,
    };
  };

  // Task actions
  const participateInTask = async () => {
    if (!address) throw new Error("Wallet not connected");

    try {
      return await writeParticipate({
        ...wagmiContractConfig,
        functionName: "performTask",
        args: [BigInt(taskId)],
      });
    } catch (err) {
      console.error("Participation error:", err);
      throw err;
    }
  };

  const distributeRewards = async () => {
    if (!address) throw new Error("Wallet not connected");
    if (!typedTask?.creator || address !== typedTask.creator) {
      throw new Error("Only task creator can distribute rewards");
    }

    try {
      return await writeDistributeRewards({
        ...wagmiContractConfig,
        functionName: "distributeRewards",
        args: [BigInt(taskId)],
      });
    } catch (err) {
      console.error("Distribution error:", err);
      throw err;
    }
  };

  return {
    task: getEnhancedTaskDetails(),
    isLoading:
      isTaskLoading || (!metadata && !error && !!typedTask?.autoDriveCid),
    error,
    actions: {
      participateInTask,
      distributeRewards,
    },
  };
}

export function useAllTasks(pageSize = 5) {
  const [tasks, setTasks] = useState<(Task & { id: number })[]>([]);
  const [metadata, setMetadata] = useState<(TaskMetadata | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Intersection observer for infinite scroll
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef, { once: false });

  // Get task counter from contract
  const { data: taskCount } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTaskIdCounter",
    config: wagmiConfig,
  });

  // Fetch tasks in batches
  const fetchTaskBatch = async (start: number, end: number) => {
    try {
      setIsLoading(true);
      const batchPromises = Array.from(
        { length: end - start },
        async (_, index) => {
          const taskId = start + index;
          const taskData = await fetchTask(taskId);
          return { ...taskData, id: taskId };
        }
      );

      const batchResults = await Promise.allSettled(batchPromises);

      // Filter out rejected promises and add successful ones
      const newTasks = batchResults
        .filter(
          (result): result is PromiseFulfilledResult<Task & { id: number }> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      // Deduplicate tasks based on ID
      setTasks((prev) => {
        const uniqueTasks = [...prev];
        newTasks.forEach((task) => {
          const index = uniqueTasks.findIndex((t) => t.id === task.id);
          if (index === -1) {
            uniqueTasks.push(task);
          }
        });
        return uniqueTasks;
      });

      // Fetch metadata for new tasks
      const metadataPromises = newTasks.map((task) =>
        task.autoDriveCid
          ? fetch(`/api/cid/metadata/${task.autoDriveCid}`)
              .then((res) => res.json())
              .catch(() => null)
          : null
      );

      const newMetadata = await Promise.all(metadataPromises);
      setMetadata((prev) => [...prev, ...newMetadata]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tasks"));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch individual task
  const fetchTask = async (taskId: number): Promise<Task> => {
    const task = await readContract(wagmiConfig, {
      ...wagmiContractConfig,
      functionName: "getTaskIdToTask",
      args: [taskId],
    });
    return task as Task;
  };

  // Reset tasks when taskCount changes
  useEffect(() => {
    setTasks([]);
    setMetadata([]);
    setCurrentPage(0);
    setHasMore(true);
    setError(null);
  }, [taskCount]);

  // Initial load and pagination with cleanup
  useEffect(() => {
    if (taskCount === undefined) return;

    const totalTasks = Number(taskCount);
    if (totalTasks === 0) {
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    const start = currentPage * pageSize;
    const end = Math.min(start + pageSize, totalTasks);
    if (start < totalTasks) {
      fetchTaskBatch(start, end);
    } else {
      setHasMore(false);
    }
  }, [taskCount, currentPage, pageSize]);

  // Load more when scrolling
  useEffect(() => {
    if (isInView && !isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isInView, isLoading, hasMore]);

  return {
    tasks: tasks
      .map((task, i) => ({
        id: task.id,
        metadata: metadata[i],
        creator: task?.creator,
        totalReward: task?.totalReward,
        deadline: task?.deadline,
        rewardsDistributed: task?.rewardsDistributed,
        tokenAddress: task?.tokenAddress,
        participants: task?.participants,
        autoDriveCid: task?.autoDriveCid,
      }))
      .filter(
        (task) => task.creator !== "0x0000000000000000000000000000000000000000"
      ),
    isLoading,
    error,
    hasMore,
    loadMoreRef,
  };
}

export function useUserCreatedTasks() {
  const { address } = useAccount();
  const [tasks, setTasks] = useState<(Task & { id: number })[]>([]);
  const [metadata, setMetadata] = useState<(TaskMetadata | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get tasks created by user from contract
  const { data: taskIds } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTasksByCreator",
    args: [address],
    config: wagmiConfig,
  });

  // Fetch tasks when we have the IDs
  useEffect(() => {
    if (!taskIds || !address) {
      setIsLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const taskPromises = (taskIds as bigint[]).map(async (id) => {
          const task = await readContract(wagmiConfig, {
            ...wagmiContractConfig,
            functionName: "getTaskIdToTask",
            args: [id],
          });
          return { ...(task as Task), id: Number(id) };
        });

        const fetchedTasks = await Promise.all(taskPromises);
        setTasks(fetchedTasks);

        // Fetch metadata for tasks
        const metadataPromises = fetchedTasks.map((task) =>
          task.autoDriveCid
            ? fetch(`/api/cid/metadata/${task.autoDriveCid}`)
                .then((res) => res.json())
                .catch(() => null)
            : null
        );

        const taskMetadata = await Promise.all(metadataPromises);
        setMetadata(taskMetadata);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch tasks")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [taskIds, address]);

  return {
    tasks: tasks.map((task, i) => ({
      id: task.id,
      metadata: metadata[i],
      creator: task.creator,
      totalReward: task.totalReward,
      deadline: task.deadline,
      rewardsDistributed: task.rewardsDistributed,
      tokenAddress: task.tokenAddress,
      participants: task.participants,
      autoDriveCid: task.autoDriveCid,
      status: getTaskStatus(task),
    })),
    isLoading,
    error,
  };
}

export function useUserParticipatedTasks() {
  const { address } = useAccount();
  const [tasks, setTasks] = useState<(Task & { id: number })[]>([]);
  const [metadata, setMetadata] = useState<(TaskMetadata | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get tasks where user is participant from contract
  const { data: taskIds } = useReadContract({
    ...wagmiContractConfig,
    functionName: "getTasksByParticipant",
    args: [address],
    config: wagmiConfig,
  });

  // Fetch tasks when we have the IDs
  useEffect(() => {
    if (!taskIds || !address) {
      setIsLoading(false);
      return;
    }
    console.log(taskIds, "participated");

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const taskPromises = (taskIds as bigint[]).map(async (id) => {
          const task = await readContract(wagmiConfig, {
            ...wagmiContractConfig,
            functionName: "getTaskIdToTask",
            args: [id],
          });
          return { ...(task as Task), id: Number(id) };
        });

        const fetchedTasks = await Promise.all(taskPromises);
        setTasks(fetchedTasks);

        // Fetch metadata for tasks
        const metadataPromises = fetchedTasks.map((task) =>
          task.autoDriveCid
            ? fetch(`/api/cid/metadata/${task.autoDriveCid}`)
                .then((res) => res.json())
                .catch(() => null)
            : null
        );

        const taskMetadata = await Promise.all(metadataPromises);
        setMetadata(taskMetadata);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch tasks")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [taskIds, address]);

  return {
    tasks: tasks.map((task, i) => ({
      id: task.id,
      metadata: metadata[i],
      creator: task.creator,
      totalReward: task.totalReward,
      deadline: task.deadline,
      rewardsDistributed: task.rewardsDistributed,
      tokenAddress: task.tokenAddress,
      participants: task.participants,
      autoDriveCid: task.autoDriveCid,
      status: getTaskStatus(task),
    })),
    isLoading,
    error,
  };
}

// Helper function to determine task status
function getTaskStatus(task: Task) {
  const now = Date.now() / 1000;
  if (task.rewardsDistributed) return "completed";
  if (Number(task.deadline) < now) return "expired";
  return "active";
}
