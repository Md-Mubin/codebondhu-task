import { apiClient } from "@/services/api"
import type { Customer } from "@/types"

export const customerService = {
  async listCustomers(): Promise<Customer[]> {
    const response = await apiClient.get<Customer[]>("/customers")
    if (!response.success) throw new Error(response.error || "Failed to fetch customers")
    return response.data
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/customers/${id}`)
    if (!response.success) throw new Error(response.error || "Failed to fetch customer")
    return response.data
  },

  async createCustomer(data: Omit<Customer, "_id" | "createdAt" | "updatedAt">): Promise<Customer> {
    const response = await apiClient.post<Customer>("/customers", data)
    if (!response.success) throw new Error(response.error || "Failed to create customer")
    return response.data
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data)
    if (!response.success) throw new Error(response.error || "Failed to update customer")
    return response.data
  },

  async deleteCustomer(id: string): Promise<void> {
    const response = await apiClient.delete(`/customers/${id}`)
    if (!response.success) throw new Error(response.error || "Failed to delete customer")
  },
}
