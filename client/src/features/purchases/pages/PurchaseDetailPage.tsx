"use client"

import { useParams, useNavigate } from "react-router-dom"
import { usePurchase } from "../hooks/usePurchases"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: purchase, isLoading: purchaseLoading } = usePurchase(id!)

  if (purchaseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!purchase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileText className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Purchase not found</p>
        <Button onClick={() => navigate("/purchases")}>Back to Purchases</Button>
      </div>
    )
  }

  const colors = {
    draft: "bg-yellow-100 text-yellow-800",
    posted: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/purchases")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Purchase #{purchase.invoiceNo || purchase._id.slice(-6)}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Supplier</p>
              <p className="font-medium">{purchase.supplierId || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(purchase.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[purchase.status]}`}>
                {purchase.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                  <th className="px-4 py-2 text-left text-sm font-medium">SKU</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Qty</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Unit Cost</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{item.name || "Unknown"}</td>
                    <td className="px-4 py-2">{item.sku || "-"}</td>
                    <td className="px-4 py-2 text-right">{item.qty}</td>
                    <td className="px-4 py-2 text-right">${item.unitCost.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-medium">Subtotal</td>
                  <td className="px-4 py-3 text-right font-bold">${purchase.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-lg font-bold">Total</td>
                  <td className="px-4 py-3 text-right text-lg font-bold">${purchase.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
