import { apiClient } from "@/services/api"
import type { Supplier } from "@/types"

export const supplierService = {
  async listSuppliers(): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>("/suppliers")
    if (!response.success) throw new Error(response.error || "Failed to fetch suppliers")
    return response.data
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await apiClient.get<Supplier>(`/suppliers/${id}`)
    if (!response.success) throw new Error(response.error || "Failed to fetch supplier")
    return response.data
  },

  async createSupplier(data: Omit<Supplier, "_id" | "createdAt" | "updatedAt">): Promise<Supplier> {
    const response = await apiClient.post<Supplier>("/suppliers", data)
    if (!response.success) throw new Error(response.error || "Failed to create supplier")
    return response.data
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.put<Supplier>(`/suppliers/${id}`, data)
    if (!response.success) throw new Error(response.error || "Failed to update supplier")
    return response.data
  },

  async deleteSupplier(id: string): Promise<void> {
    const response = await apiClient.delete(`/suppliers/${id}`)
    if (!response.success) throw new Error(response.error || "Failed to delete supplier")
  },
}
