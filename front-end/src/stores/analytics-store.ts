import { create } from 'zustand'

interface TaskAnalytics {
  totalTasks: number
  activeTasks: number
  completedTasks: number
  totalRewardsDistributed: number
  averageParticipation: number
  completionRate: number
  averageRewardPerTask: number
  tasksByDate: Record<string, number>
  participationByDate: Record<string, number>
  rewardsByDate: Record<string, number>
}

interface AnalyticsState {
  isLoading: boolean
  data: TaskAnalytics | null
  timeframe: 'week' | 'month' | 'year'
  setTimeframe: (timeframe: 'week' | 'month' | 'year') => void
  fetchAnalytics: () => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  isLoading: false,
  data: null,
  timeframe: 'month',
  setTimeframe: (timeframe) => set({ timeframe }),
  fetchAnalytics: async () => {
    set({ isLoading: true })
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      set({
        data: {
          totalTasks: 156,
          activeTasks: 45,
          completedTasks: 111,
          totalRewardsDistributed: 15600,
          averageParticipation: 7.8,
          completionRate: 0.85,
          averageRewardPerTask: 100,
          tasksByDate: {
            // Sample data
            '2024-03-01': 5,
            '2024-03-02': 8,
            // ... more dates
          },
          participationByDate: {
            '2024-03-01': 35,
            '2024-03-02': 42,
            // ... more dates
          },
          rewardsByDate: {
            '2024-03-01': 500,
            '2024-03-02': 800,
            // ... more dates
          }
        }
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      set({ isLoading: false })
    }
  }
})) 