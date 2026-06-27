"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useCustomers, useDeleteCustomer } from "../hooks/useCustomers"
import { useAuth } from "@/providers/AuthProvider"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/providers/useToast"
import { Trash2, Edit, Plus, Users } from "lucide-react"
import type { Customer } from "@/types"

export default function CustomersPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.role === "admin" || user?.role === "manager"
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const { data: customers = [], isLoading } = useCustomers()
  const deleteMutation = useDeleteCustomer()

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: "Customer deleted", description: "Customer has been deactivated successfully." })
      setDeleteId(null)
    } catch {
      toast({ title: "Error", description: "Failed to delete customer.", variant: "destructive" })
    }
  }, [deleteId, deleteMutation, toast])

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email", render: (item: Customer) => item.email || "-" },
    { key: "phone", header: "Phone", render: (item: Customer) => item.phone || "-" },
    { key: "address", header: "Address", render: (item: Customer) => item.address || "-" },
    {
      key: "isActive",
      header: "Status",
      render: (item: Customer) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Customer) =>
        canManage ? (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${item._id}/edit`)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(item._id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ) : null,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your customer base"
        action={
          canManage && (
            <Button onClick={() => navigate("/customers/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )
        }
      />

      <DataTable
        data={filteredCustomers}
        columns={columns}
        searchable
        searchPlaceholder="Search customers..."
        onSearch={setSearch}
        loading={isLoading}
        emptyMessage="No customers found. Create your first customer!"
        emptyIcon={<Users className="h-12 w-12 text-gray-300" />}
      />

      {canManage && (
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete Customer"
          description="Are you sure you want to delete this customer? This action cannot be undone."
          onConfirm={handleDelete}
          confirmText="Delete"
          variant="destructive"
        />
      )}
    </div>
  )
}
