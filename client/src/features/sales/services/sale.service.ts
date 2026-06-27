import { apiClient } from "@/services/api"
import type { Sale, PostedSaleResult } from "@/types"

export const saleService = {
  async listSales(): Promise<Sale[]> {
    const response = await apiClient.get<Sale[]>("/sales")
    if (!response.success) throw new Error(response.error || "Failed to fetch sales")
    return response.data
  },

  async getSale(id: string): Promise<Sale> {
    const response = await apiClient.get<Sale>(`/sales/${id}`)
    if (!response.success) throw new Error(response.error || "Failed to fetch sale")
    return response.data
  },

  async createSale(data: Omit<Sale, "_id" | "createdAt" | "updatedAt">): Promise<Sale> {
    const response = await apiClient.post<PostedSaleResult>("/sales", data)
    if (!response.success) throw new Error(response.error || "Failed to create sale")
    return response.data.sale
  },

  async updateSale(id: string, data: Partial<Sale>): Promise<Sale> {
    const response = await apiClient.put<Sale>(`/sales/${id}`, data)
    if (!response.success) throw new Error(response.error || "Failed to update sale")
    return response.data
  },

  async postSale(id: string): Promise<PostedSaleResult> {
    const response = await apiClient.post<PostedSaleResult>(`/sales/${id}/post`)
    if (!response.success) throw new Error(response.error || "Failed to post sale")
    return response.data
  },

  async cancelSale(id: string): Promise<Sale> {
    const response = await apiClient.post<Sale>(`/sales/${id}/cancel`)
    if (!response.success) throw new Error(response.error || "Failed to cancel sale")
    return response.data
  },

  async downloadInvoice(id: string): Promise<Blob> {
    return apiClient.getBlob(`/sales/${id}/invoice`)
  },

  getInvoiceUrl(id: string): string {
    const baseUrl = import.meta.env.VITE_API_URL;
    return `${baseUrl}/sales/${id}/invoice`
  }
}
