import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "../services/dashboard.service"

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardService.getOverview,
  })
}

export function useTopProducts() {
  return useQuery({
    queryKey: ["dashboard", "top-products"],
    queryFn: dashboardService.getTopProducts,
  })
}
