import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryProvider } from "@/providers/QueryProvider"
import { AuthProvider } from "@/providers/AuthProvider"
import { ToastProvider } from "@/providers/ToastProvider"
import MainLayout from "@/layouts/MainLayout"
import { PrivateRoute } from "@/routes/PrivateRoute"
import { RequireRole } from "@/routes/RequireRole"
import { PublicRoute } from "./routes"

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"))
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"))
const UsersPage = lazy(() => import("@/features/users/pages/UsersPage"))
const ProductsPage = lazy(() => import("@/features/products/pages/ProductsPage"))
const ProductFormPage = lazy(() => import("@/features/products/pages/ProductFormPage"))
const CustomersPage = lazy(() => import("@/features/customers/pages/CustomersPage"))
const CustomerFormPage = lazy(() => import("@/features/customers/pages/CustomerFormPage"))
const SuppliersPage = lazy(() => import("@/features/suppliers/pages/SuppliersPage"))
const SupplierFormPage = lazy(() => import("@/features/suppliers/pages/SupplierFormPage"))
const PurchaseDetailPage = lazy(() => import("@/features/purchases/pages/PurchaseDetailPage"))
const PurchasesPage = lazy(() => import("@/features/purchases/pages/PurchasesPage"))
const PurchaseFormPage = lazy(() => import("@/features/purchases/pages/PurchaseFormPage"))
const SalesPage = lazy(() => import("@/features/sales/pages/SalesPage"))
const SaleFormPage = lazy(() => import("@/features/sales/pages/SaleFormPage"))
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"))
const SaleDetailPage = lazy(() => import("@/features/sales/pages/SaleDetailPage"))

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>
                <Route path="/" element={<PrivateRoute />}>
                  <Route element={<MainLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="users" element={
                      <RequireRole allowedRoles={["admin"]}>
                        <UsersPage />
                      </RequireRole>
                    } />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/new" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <ProductFormPage />
                      </RequireRole>
                    } />
                    <Route path="products/:id/edit" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <ProductFormPage />
                      </RequireRole>
                    } />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="customers/new" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <CustomerFormPage />
                      </RequireRole>
                    } />
                    <Route path="customers/:id/edit" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <CustomerFormPage />
                      </RequireRole>
                    } />
                    <Route path="suppliers" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <SuppliersPage />
                      </RequireRole>
                    } />
                    <Route path="suppliers/new" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <SupplierFormPage />
                      </RequireRole>
                    } />
                    <Route path="suppliers/:id/edit" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <SupplierFormPage />
                      </RequireRole>
                    } />
                    <Route path="purchases" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <PurchasesPage />
                      </RequireRole>
                    } />
                    <Route path="purchases/new" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <PurchaseFormPage />
                      </RequireRole>
                    } />
                    <Route path="purchases/:id" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <PurchaseDetailPage />
                      </RequireRole>
                    } />
                    <Route path="sales" element={<SalesPage />} />
                    <Route path="sales/new" element={
                      <RequireRole allowedRoles={["admin", "manager", "clerk"]}>
                        <SaleFormPage />
                      </RequireRole>
                    } />
                    <Route path="sales/:id" element={<SaleDetailPage />} />
                    <Route path="reports" element={
                      <RequireRole allowedRoles={["admin", "manager"]}>
                        <ReportsPage />
                      </RequireRole>
                    } />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  )
}

export default App
