import { apiClient } from "@/services/api"
import type { Product, PaginatedResponse } from "@/types"

export const productService = {
  async listProducts(page = 1, limit = 20, q = ""): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>("/products", {
      page,
      limit,
      q,
    })
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch products")
    }
    return response.data
  },

  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`)
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch product")
    }
    return response.data
  },

  async createProduct(data: Omit<Product, "_id" | "createdAt" | "updatedAt">): Promise<Product> {
    const response = await apiClient.post<Product>("/products", data)
    if (!response.success) {
      throw new Error(response.error || "Failed to create product")
    }
    return response.data
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data)
    if (!response.success) {
      throw new Error(response.error || "Failed to update product")
    }
    return response.data
  },

  async deleteProduct(id: string): Promise<void> {
    const response = await apiClient.delete(`/products/${id}`)
    if (!response.success) {
      throw new Error(response.error || "Failed to delete product")
    }
  },

  async findOrCreateProduct(data: { sku: string; name: string; supplierId?: string }): Promise<Product> {
    const response = await apiClient.post<Product>("/products/find-or-create", data)
    if (!response.success) throw new Error(response.error || "Failed to find or create product")
    return response.data
  },
}
