export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface User {
  _id: string
  email: string
  name?: string
  role: "admin" | "manager" | "clerk"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface Product {
  _id: string
  sku: string
  name: string
  description?: string
  unitPrice: number
  costPrice: number
  stock: number
  reorderPoint: number
  isActive: boolean
  supplierId?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  _id: string
  name: string
  email?: string
  phone?: string
  address?: string
  paymentTerms?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PurchaseItem {
  productId?: string;
  sku?: string;
  name?: string;
  qty: number;
  unitCost: number;
  lineTotal: number;
}

export interface Purchase {
  _id: string
  supplierId: string
  invoiceNo?: string
  date: string
  items: PurchaseItem[]
  subtotal: number
  total: number
  status: "draft" | "posted" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  productId: string
  sku?: string
  name?: string
  qty: number
  unitPrice: number
  lineTotal: number
}

export interface Sale {
  _id: string
  customerId: Customer | any
  invoiceNo?: string
  date: string
  items: SaleItem[]
  subtotal: number
  total: number
  status: "draft" | "posted" | "cancelled"
  createdAt: string
  updatedAt: string
}

export interface PostedSaleResult {
  sale: Sale
  invoicePath: string
}

export interface DashboardOverview {
  totalSales: number
  totalPurchases: number
  totalProducts: number
  totalCustomers: number
  totalSuppliers: number
  revenue: number
  lowStock: Product[]
}

export interface TopProduct {
  _id: string
  qty: number
}

export interface InventoryTransaction {
  _id: string
  productId: string
  type: string
  referenceId?: string
  qtyChange: number
  previousStock?: number
  newStock?: number
  note?: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface SalesReportData {
  totalSales: number
  count: number
}

export interface PurchasesReportData {
  totalPurchases: number
  count: number
}

export interface StockValuationItem {
  _id: string
  sku: string
  name: string
  stock: number
  unitPrice: number
  value: number
}
