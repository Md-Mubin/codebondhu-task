import { apiClient } from "@/services/api"
import type { Purchase } from "@/types"

export const purchaseService = {
  async listPurchases(): Promise<Purchase[]> {
    const response = await apiClient.get<Purchase[]>("/purchases")
    if (!response.success) throw new Error(response.error || "Failed to fetch purchases")
    return response.data
  },

  async getPurchase(id: string): Promise<Purchase> {
    const response = await apiClient.get<Purchase>(`/purchases/${id}`)
    if (!response.success) throw new Error(response.error || "Failed to fetch purchase")
    return response.data
  },

  async createPurchase(data: Omit<Purchase, "_id" | "createdAt" | "updatedAt">): Promise<Purchase> {
    const response = await apiClient.post<Purchase>("/purchases", data)
    if (!response.success) throw new Error(response.error || "Failed to create purchase")
    return response.data
  },

  async updatePurchase(id: string, data: Partial<Purchase>): Promise<Purchase> {
    const response = await apiClient.put<Purchase>(`/purchases/${id}`, data)
    if (!response.success) throw new Error(response.error || "Failed to update purchase")
    return response.data
  },

  async postPurchase(id: string): Promise<Purchase> {
    const response = await apiClient.post<Purchase>(`/purchases/${id}/post`)
    if (!response.success) throw new Error(response.error || "Failed to post purchase")
    return response.data
  },

  async cancelPurchase(id: string): Promise<Purchase> {
    const response = await apiClient.post<Purchase>(`/purchases/${id}/cancel`)
    if (!response.success) throw new Error(response.error || "Failed to cancel purchase")
    return response.data
  },
}
