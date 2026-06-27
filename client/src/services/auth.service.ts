import { apiClient } from "@/services/api"
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types"

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data)
    if (!response.success || !response.data?.token) {
      throw new Error(response.error || "Login failed")
    }
    return response.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)
    if (!response.success || !response.data?.token) {
      throw new Error(response.error || "Registration failed")
    }
    return response.data
  },
}
