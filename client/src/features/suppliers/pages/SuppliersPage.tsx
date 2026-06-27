"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSuppliers, useDeleteSupplier } from "../hooks/useSuppliers"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/providers/useToast"
import { Trash2, Edit, Plus, Truck } from "lucide-react"
import type { Supplier } from "@/types"

export default function SuppliersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: suppliers = [], isLoading } = useSuppliers()
  const deleteMutation = useDeleteSupplier()

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: "Supplier deleted", description: "Supplier has been deactivated successfully." })
      setDeleteId(null)
    } catch {
      toast({ title: "Error", description: "Failed to delete supplier.", variant: "destructive" })
    }
  }, [deleteId, deleteMutation, toast])

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email", render: (item: Supplier) => item.email || "-" },
    { key: "phone", header: "Phone", render: (item: Supplier) => item.phone || "-" },
    { key: "address", header: "Address", render: (item: Supplier) => item.address || "-" },
    { key: "paymentTerms", header: "Payment Terms", render: (item: Supplier) => item.paymentTerms || "-" },
    {
      key: "isActive",
      header: "Status",
      render: (item: Supplier) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Supplier) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/suppliers/${item._id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item._id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage your supplier relationships"
        action={
          <Button onClick={() => navigate("/suppliers/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        }
      />

      <DataTable
        data={filteredSuppliers}
        columns={columns}
        searchable
        searchPlaceholder="Search suppliers..."
        onSearch={setSearch}
        loading={isLoading}
        emptyMessage="No suppliers found. Create your first supplier!"
        emptyIcon={<Truck className="h-12 w-12 text-gray-300" />}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Supplier"
        description="Are you sure you want to delete this supplier? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  )
}
