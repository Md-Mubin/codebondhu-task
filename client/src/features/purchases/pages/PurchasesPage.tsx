"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { usePurchases, usePostPurchase, useCancelPurchase } from "../hooks/usePurchases"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/providers/useToast"
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react"
import type { Purchase } from "@/types"

export default function PurchasesPage() {
  const navigate = useNavigate()
  const [postId, setPostId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: purchases = [], isLoading } = usePurchases()
  const postMutation = usePostPurchase()
  const cancelMutation = useCancelPurchase()

  const handlePost = useCallback(async () => {
    if (!postId) return
    try {
      await postMutation.mutateAsync(postId)
      toast({ title: "Purchase posted", description: "Stock has been updated.", variant: "success" })
      setPostId(null)
    } catch {
      toast({ title: "Error", description: "Failed to post purchase.", variant: "destructive" })
    }
  }, [postId, postMutation, toast])

  const handleCancel = useCallback(async () => {
    if (!cancelId) return
    try {
      await cancelMutation.mutateAsync(cancelId)
      toast({ title: "Purchase cancelled", description: "Purchase has been cancelled." })
      setCancelId(null)
    } catch {
      toast({ title: "Error", description: "Failed to cancel purchase.", variant: "destructive" })
    }
  }, [cancelId, cancelMutation, toast])

  const columns = [
    {
      key: "invoiceNo",
      header: "Invoice",
      render: (item: Purchase) => item.invoiceNo || <span className="text-gray-400">-</span>,
    },
    { key: "date", header: "Date", render: (item: Purchase) => new Date(item.date).toLocaleDateString() },
    { key: "total", header: "Total", render: (item: Purchase) => `$${item.total.toFixed(2)}` },
    {
      key: "status",
      header: "Status",
      render: (item: Purchase) => {
        const colors = {
          draft: "bg-yellow-100 text-yellow-800",
          posted: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
        }
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[item.status as keyof typeof colors]}`}>
            {item.status}
          </span>
        )
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Purchase) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/purchases/${item._id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          {item.status === "draft" && (
            <Button variant="ghost" size="sm" onClick={() => setPostId(item._id)} title="Post">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {item.status === "posted" && (
            <Button variant="ghost" size="sm" onClick={() => setCancelId(item._id)} title="Cancel">
              <XCircle className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="Manage purchase orders"
        action={
          <Button onClick={() => navigate("/purchases/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Purchase
          </Button>
        }
      />

      <DataTable
        data={purchases}
        columns={columns}
        loading={isLoading}
        emptyMessage="No purchases found. Create your first purchase order!"
      />

      <ConfirmDialog
        open={!!postId}
        onOpenChange={(open) => !open && setPostId(null)}
        title="Post Purchase"
        description="Are you sure you want to post this purchase? This will update stock levels."
        onConfirm={handlePost}
        confirmText="Post"
      />

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancel Purchase"
        description="Are you sure you want to cancel this purchase? This will reverse stock changes."
        onConfirm={handleCancel}
        confirmText="Cancel"
        variant="destructive"
      />
    </div>
  )
}
