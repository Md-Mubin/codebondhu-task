"use client"

import { useDashboardOverview, useTopProducts } from "../hooks/useDashboard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/StatCard"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Package, Users, Truck, ShoppingCart, ShoppingBag, UserCog } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { useUsers } from "@/features/users/hooks/useUsers"
import { useAuth } from "@/providers/AuthProvider"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview()
  const { data: topProducts, isLoading: productsLoading } = useTopProducts()
  const { data: users } = useUsers()
  const isLoading = overviewLoading || productsLoading

  const clerkCount = users?.filter((u) => u.role === "clerk").length ?? 0
  const managerCount = users?.filter((u) => u.role === "manager").length ?? 0
  const isAdmin = user?.role === "admin"

  if (overviewError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <EmptyState
          title="Failed to load dashboard"
          description="Please try refreshing the page."
        />
      </div>
    )
  }

  const chartData = topProducts?.map((item) => ({
    name: item._id.slice(0, 8),
    quantity: item.qty,
  })) || []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Products"
              value={overview?.totalProducts || 0}
              icon={<Package className="h-6 w-6" />}
            />
            <StatCard
              title="Total Customers"
              value={overview?.totalCustomers || 0}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Total Suppliers"
              value={overview?.totalSuppliers || 0}
              icon={<Truck className="h-6 w-6" />}
            />
            <StatCard
              title="Total Purchases"
              value={overview?.totalPurchases || 0}
              icon={<ShoppingCart className="h-6 w-6" />}
            />
            <StatCard
              title="Total Sales"
              value={overview?.totalSales || 0}
              icon={<ShoppingBag className="h-6 w-6" />}
            />
            {isAdmin && (
              <StatCard
                title="Total Clerks"
                value={clerkCount}
                icon={<UserCog className="h-6 w-6" />}
              />
            )}
            {isAdmin && (
              <StatCard
                title="Total Managers"
                value={managerCount}
                icon={<UserCog className="h-6 w-6" />}
              />
            )}
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No data"
                description="No product data available yet."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : overview?.lowStock && overview.lowStock.length > 0 ? (
              <div className="space-y-4">
                {overview.lowStock.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{product.stock} left</p>
                      <p className="text-xs text-gray-500">Reorder at: {product.reorderPoint}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="All good!"
                description="No low stock items found."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
