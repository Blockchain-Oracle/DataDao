import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskStatus = "all" | "active" | "completed" | "expired";
export type SortOption =
  | "newest"
  | "oldest"
  | "reward-high"
  | "reward-low"
  | "deadline";

interface TaskFilterState {
  search: string;
  status: TaskStatus;
  sortBy: SortOption;
  rewardRange: [number, number];
  participantsRange: [number, number];
  creatorAddress: string | null;
  dateRange: [Date | null, Date | null];
  setSearch: (search: string) => void;
  setStatus: (status: TaskStatus) => void;
  setSortBy: (sort: SortOption) => void;
  setRewardRange: (range: [number, number]) => void;
  setParticipantsRange: (range: [number, number]) => void;
  setCreatorAddress: (address: string | null) => void;
  setDateRange: (range: [Date | null, Date | null]) => void;
  resetFilters: () => void;
}

export const useTaskFilterStore = create<TaskFilterState>()(
  persist(
    (set) => ({
      search: "",
      status: "all",
      sortBy: "newest",
      rewardRange: [0, 1000],
      participantsRange: [0, 100],
      creatorAddress: null,
      dateRange: [null, null],
      setSearch: (search) => set({ search }),
      setStatus: (status) => set({ status }),
      setSortBy: (sortBy) => set({ sortBy }),
      setRewardRange: (rewardRange) => set({ rewardRange }),
      setParticipantsRange: (participantsRange) => set({ participantsRange }),
      setCreatorAddress: (creatorAddress) => set({ creatorAddress }),
      setDateRange: (dateRange) => set({ dateRange }),
      resetFilters: () =>
        set({
          search: "",
          status: "all",
          sortBy: "newest",
          rewardRange: [0, 1000],
          participantsRange: [0, 100],
          creatorAddress: null,
          dateRange: [null, null],
        }),
    }),
    {
      name: "task-filters",
    }
  )
);
