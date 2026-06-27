import { apiClient } from "@/services/api"
import type { DashboardOverview, TopProduct } from "@/types"

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<DashboardOverview>("/dashboard/overview")
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch dashboard overview")
    }
    return response.data
  },

  async getTopProducts(): Promise<TopProduct[]> {
    const response = await apiClient.get<TopProduct[]>("/dashboard/top-products")
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch top products")
    }
    return response.data
  },
}
