import { apiClient } from "@/services/api"
import type { SalesReportData, PurchasesReportData, StockValuationItem } from "@/types"

export const reportService = {
  async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReportData> {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const response = await apiClient.get<SalesReportData>("/reports/sales", { params })
    if (!response.success) throw new Error(response.error || "Failed to fetch sales report")
    return response.data
  },

  async getPurchasesReport(startDate?: string, endDate?: string): Promise<PurchasesReportData> {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const response = await apiClient.get<PurchasesReportData>("/reports/purchases", { params })
    if (!response.success) throw new Error(response.error || "Failed to fetch purchases report")
    return response.data
  },

  async getStockValuation(): Promise<StockValuationItem[]> {
    const response = await apiClient.get<StockValuationItem[]>("/reports/stock-valuation")
    if (!response.success) throw new Error(response.error || "Failed to fetch stock valuation")
    return response.data
  },
}
