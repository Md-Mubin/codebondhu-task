import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { saleService } from "../services/sale.service"

export function useSales() {
  return useQuery({
    queryKey: ["sales"],
    queryFn: saleService.listSales,
  })
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => saleService.getSale(id),
    enabled: !!id,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saleService.createSale,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales"] }),
  })
}

export function useUpdateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import("@/types").Sale> }) =>
      saleService.updateSale(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales"] }),
  })
}

export function usePostSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saleService.postSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saleService.cancelSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
