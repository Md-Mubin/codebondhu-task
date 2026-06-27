import { useQuery } from "@tanstack/react-query"
import { reportService } from "../services/report.service"

export function useSalesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["reports", "sales", startDate, endDate],
    queryFn: () => reportService.getSalesReport(startDate, endDate),
  })
}

export function usePurchasesReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["reports", "purchases", startDate, endDate],
    queryFn: () => reportService.getPurchasesReport(startDate, endDate),
  })
}

export function useStockValuation() {
  return useQuery({
    queryKey: ["reports", "stock-valuation"],
    queryFn: reportService.getStockValuation,
  })
}
