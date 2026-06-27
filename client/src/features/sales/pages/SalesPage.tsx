"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSales, usePostSale, useCancelSale } from "../hooks/useSales"
import { useAuth } from "@/providers/AuthProvider"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/providers/useToast"
import { Plus, Eye, CheckCircle, XCircle } from "lucide-react"
import type { Sale } from "@/types"

export default function SalesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.role === "admin" || user?.role === "manager"
  const [postId, setPostId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: sales = [], isLoading } = useSales()
  const postMutation = usePostSale()
  const cancelMutation = useCancelSale()

  const handlePost = useCallback(async () => {
    if (!postId) return
    try {
      const result = await postMutation.mutateAsync(postId)
      toast({
        title: "Sale posted",
        description: result.invoicePath ? "Invoice generated successfully." : "Sale has been posted.",
        variant: "success",
      })
      setPostId(null)
    } catch {
      toast({ title: "Error", description: "Failed to post sale.", variant: "destructive" })
    }
  }, [postId, postMutation, toast])

  const handleCancel = useCallback(async () => {
    if (!cancelId) return
    try {
      await cancelMutation.mutateAsync(cancelId)
      toast({ title: "Sale cancelled", description: "Sale has been cancelled." })
      setCancelId(null)
    } catch {
      toast({ title: "Error", description: "Failed to cancel sale.", variant: "destructive" })
    }
  }, [cancelId, cancelMutation, toast])

  const columns = [
    {
      key: "invoiceNo",
      header: "Invoice",
      render: (item: Sale) => item.invoiceNo || <span className="text-gray-400">-</span>,
    },
    { key: "date", header: "Date", render: (item: Sale) => new Date(item.date).toLocaleDateString() },
    { key: "total", header: "Total", render: (item: Sale) => `$${item.total.toFixed(2)}` },
    {
      key: "status",
      header: "Status",
      render: (item: Sale) => {
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
      render: (item: Sale) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/sales/${item._id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          {canManage && item.status === "draft" && (
            <Button variant="ghost" size="sm" onClick={() => setPostId(item._id)} title="Post">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </Button>
          )}
          {canManage && item.status === "posted" && (
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
        title="Sales"
        description="Manage sales orders"
        action={
          <Button onClick={() => navigate("/sales/new")}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        }
      />

      <DataTable
        data={sales}
        columns={columns}
        loading={isLoading}
        emptyMessage="No sales found. Create your first sale!"
      />

      {canManage && (
        <>
          <ConfirmDialog
            open={!!postId}
            onOpenChange={(open) => !open && setPostId(null)}
            title="Post Sale"
            description="Are you sure you want to post this sale? Stock will be deducted and an invoice will be generated."
            onConfirm={handlePost}
            confirmText="Post"
          />

          <ConfirmDialog
            open={!!cancelId}
            onOpenChange={(open) => !open && setCancelId(null)}
            title="Cancel Sale"
            description="Are you sure you want to cancel this sale? This will reverse stock changes."
            onConfirm={handleCancel}
            confirmText="Cancel"
            variant="destructive"
          />
        </>
      )}
    </div>
  )
}
