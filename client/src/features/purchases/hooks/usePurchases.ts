import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { purchaseService } from "../services/purchase.service"

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: purchaseService.listPurchases,
  })
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ["purchases", id],
    queryFn: () => purchaseService.getPurchase(id),
    enabled: !!id,
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purchaseService.createPurchase,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  })
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import("@/types").Purchase> }) =>
      purchaseService.updatePurchase(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  })
}

export function usePostPurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purchaseService.postPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useCancelPurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: purchaseService.cancelPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
