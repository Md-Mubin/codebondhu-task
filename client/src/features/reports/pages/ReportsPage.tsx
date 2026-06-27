"use client"

import { useState } from "react"
import { useSalesReport, usePurchasesReport, useStockValuation } from "../hooks/useReports"
import { useProducts } from "@/features/products/hooks/useProducts"
import { useCustomers } from "@/features/customers/hooks/useCustomers"
import { useSuppliers } from "@/features/suppliers/hooks/useSuppliers"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, Package, Users, Truck } from "lucide-react"
import type { Product, Customer, Supplier, StockValuationItem } from "@/types"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  const { data: salesReport, isLoading: salesLoading } = useSalesReport(dateRange.start, dateRange.end)
  const { data: purchasesReport, isLoading: purchasesLoading } = usePurchasesReport(dateRange.start, dateRange.end)
  const { data: stockValuation, isLoading: valuationLoading } = useStockValuation()
  const { data: productsData } = useProducts()
  const products = productsData?.items || []
  const { data: customers = [] } = useCustomers()
  const { data: suppliers = [] } = useSuppliers()

  const downloadCSV = (data: unknown[], filename: string) => {
    if (!data.length) return
    const headers = Object.keys(data[0] as Record<string, unknown>)
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? "")).join(",")
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const productColumns = [
    { key: "sku", header: "SKU" },
    { key: "name", header: "Name" },
    { key: "unitPrice", header: "Unit Price", render: (item: Product) => `$${item.unitPrice.toFixed(2)}` },
    { key: "costPrice", header: "Cost Price", render: (item: Product) => `$${item.costPrice.toFixed(2)}` },
    { key: "stock", header: "Stock" },
    { key: "reorderPoint", header: "Reorder Point" },
  ]

  const customerColumns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email", render: (item: Customer) => item.email || "-" },
    { key: "phone", header: "Phone", render: (item: Customer) => item.phone || "-" },
    { key: "address", header: "Address", render: (item: Customer) => item.address || "-" },
  ]

  const supplierColumns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email", render: (item: Supplier) => item.email || "-" },
    { key: "phone", header: "Phone", render: (item: Supplier) => item.phone || "-" },
    { key: "paymentTerms", header: "Payment Terms", render: (item: Supplier) => item.paymentTerms || "-" },
  ]

  const stockValuationColumns = [
    { key: "sku", header: "SKU" },
    { key: "name", header: "Name" },
    { key: "stock", header: "Stock" },
    { key: "unitPrice", header: "Unit Cost", render: (item: StockValuationItem) => `$${item.unitPrice.toFixed(2)}` },
    { key: "value", header: "Value", render: (item: StockValuationItem) => `$${item.value.toFixed(2)}` },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="View and export business reports" />

      <Card>
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input
                id="start"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input
                id="end"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Valuation</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sales Report</h3>
            {salesReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV([salesReport] as unknown[], "sales-report")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
          {salesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : salesReport ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold">${salesReport.totalSales.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold">{salesReport.count}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-gray-500">No sales data available.</p>
          )}
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Purchase Report</h3>
            {purchasesReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV([purchasesReport] as unknown[], "purchases-report")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
          {purchasesLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : purchasesReport ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Purchases</p>
                  <p className="text-2xl font-bold">${purchasesReport.totalPurchases.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold">{purchasesReport.count}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-gray-500">No purchase data available.</p>
          )}
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Stock Valuation</h3>
            {stockValuation && stockValuation.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV(stockValuation as unknown[], "stock-valuation")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
          {valuationLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : stockValuation && stockValuation.length > 0 ? (
            <DataTable
              data={stockValuation as StockValuationItem[]}
              columns={stockValuationColumns}
              emptyMessage="No stock data available."
            />
          ) : (
            <p className="text-gray-500">No stock data available.</p>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Product Report</h3>
            <Button
              variant="outline"
              size="sm"
               onClick={() => downloadCSV(products as unknown[], "products-report")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <DataTable
            data={products}
            columns={productColumns}
            emptyMessage="No products found."
            emptyIcon={<Package className="h-12 w-12 text-gray-300" />}
          />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customer Report</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(customers as unknown[], "customers-report")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <DataTable
            data={customers}
            columns={customerColumns}
            emptyMessage="No customers found."
            emptyIcon={<Users className="h-12 w-12 text-gray-300" />}
          />
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Supplier Report</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadCSV(suppliers as unknown[], "suppliers-report")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <DataTable
            data={suppliers}
            columns={supplierColumns}
            emptyMessage="No suppliers found."
            emptyIcon={<Truck className="h-12 w-12 text-gray-300" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
