"use client"

import { useParams, useNavigate } from "react-router-dom"
import { useSale } from "../hooks/useSales"
import { saleService } from "../services/sale.service"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, FileText, Download } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"

export default function SaleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isDownloading, setIsDownloading] = useState(false)
  const { data: sale, isLoading: saleLoading } = useSale(id!)

  if (saleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FileText className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Sale not found</p>
        <Button onClick={() => navigate("/sales")}>Back to Sales</Button>
      </div>
    )
  }

  const colors = {
    draft: "bg-yellow-100 text-yellow-800",
    posted: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const raw = await saleService.downloadInvoice(sale._id)

      // Force the correct MIME type so the browser treats it as a PDF,
      // not as plain binary / octet-stream.
      const pdfBlob = new Blob([raw], { type: "application/pdf" })

      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${sale.invoiceNo || sale._id.slice(-6)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/sales")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Invoice #{sale.invoiceNo || sale._id.slice(-6)}
        </h1>
        {sale.status === "posted" && (
          <Button variant="outline" size="sm" disabled={isDownloading} onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download Invoice"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{sale.customerId?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(sale.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[sale.status]}`}>
                {sale.status}
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
                  <th className="px-4 py-2 text-right text-sm font-medium">Unit Price</th>
                  <th className="px-4 py-2 text-right text-sm font-medium">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.sku}</td>
                    <td className="px-4 py-2 text-right">{item.qty}</td>
                    <td className="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">${item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-medium">Subtotal</td>
                  <td className="px-4 py-3 text-right font-bold">${sale.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-lg font-bold">Total</td>
                  <td className="px-4 py-3 text-right text-lg font-bold">${sale.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}