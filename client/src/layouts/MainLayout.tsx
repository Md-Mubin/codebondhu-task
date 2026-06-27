"use client"

import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "@/providers/AuthProvider"
import { LayoutDashboard, Package, Users, Truck, ShoppingCart, ShoppingBag, FileText, LogOut, Menu, X, UserCog } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const allNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "manager", "clerk"] },
  { name: "Products", href: "/products", icon: Package, roles: ["admin", "manager", "clerk"] },
  { name: "Customers", href: "/customers", icon: Users, roles: ["admin", "manager", "clerk"] },
  { name: "Suppliers", href: "/suppliers", icon: Truck, roles: ["admin", "manager"] },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart, roles: ["admin", "manager"] },
  { name: "Sales", href: "/sales", icon: ShoppingBag, roles: ["admin", "manager", "clerk"] },
  { name: "Reports", href: "/reports", icon: FileText, roles: ["admin", "manager"] },
  { name: "Users", href: "/users", icon: UserCog, roles: ["admin"] },
]

export default function MainLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = user
    ? allNavigation.filter((item) => item.roles.includes(user.role))
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">CodeBondhuit ERP</h1>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {location.pathname.replace("/", "") || "Dashboard"}
            </h2>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
