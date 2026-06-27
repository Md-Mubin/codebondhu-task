"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useProducts, useDeleteProduct } from "../hooks/useProducts"
import { useAuth } from "@/providers/AuthProvider"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/providers/useToast"
import { Trash2, Edit, Plus, Package } from "lucide-react"
import type { Product } from "@/types"

export default function ProductsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.role === "admin" || user?.role === "manager"
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data, isLoading } = useProducts(page, 20, search)
  const deleteMutation = useDeleteProduct()

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({
        title: "Product deleted",
        description: "Product has been deactivated successfully.",
      })
      setDeleteId(null)
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      })
    }
  }, [deleteId, deleteMutation, toast])

  const columns = [
    { key: "sku", header: "SKU" },
    { key: "name", header: "Name" },
    { key: "unitPrice", header: "Unit Price", render: (item: Product) => `$${item.unitPrice.toFixed(2)}` },
    { key: "costPrice", header: "Cost Price", render: (item: Product) => `$${item.costPrice.toFixed(2)}` },
    { key: "stock", header: "Stock", render: (item: Product) => (
      <span className={item.stock <= item.reorderPoint ? "text-red-600 font-medium" : ""}>
        {item.stock}
      </span>
    )},
    { key: "isActive", header: "Status", render: (item: Product) => (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
        {item.isActive ? "Active" : "Inactive"}
      </span>
    )},
    {
      key: "actions",
      header: "Actions",
      render: (item: Product) =>
        canManage ? (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/products/${item._id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(item._id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ) : null,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your product inventory"
        action={
          canManage && (
            <Button onClick={() => navigate("/products/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )
        }
      />

      <DataTable
        data={data?.items || []}
        columns={columns}
        searchable
        searchPlaceholder="Search products..."
        onSearch={(q) => {
          setSearch(q)
          setPage(1)
        }}
        loading={isLoading}
        emptyMessage="No products found. Create your first product!"
        emptyIcon={<Package className="h-12 w-12 text-gray-300" />}
        pagination={
          data
            ? {
                page,
                limit: 20,
                total: data.total,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {canManage && (
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </div>
  )
}
