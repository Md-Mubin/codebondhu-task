import { apiClient } from "@/services/api"
import type { User } from "@/types"

export const userService = {
  async listUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>("/users")
    if (!response.success) {
      throw new Error(response.error || "Failed to fetch users")
    }
    return response.data
  },

  async createUser(data: { email: string; password: string; name?: string; role?: User["role"] }): Promise<User> {
    const response = await apiClient.post<User>("/users", data)
    if (!response.success) {
      throw new Error(response.error || "Failed to create user")
    }
    return response.data
  },

  async updateUserRole(id: string, role: User["role"]): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, { role })
    if (!response.success) {
      throw new Error(response.error || "Failed to update user")
    }
    return response.data
  },

  async toggleUserActive(id: string, isActive: boolean): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, { isActive })
    if (!response.success) {
      throw new Error(response.error || "Failed to update user status")
    }
    return response.data
  },
}
