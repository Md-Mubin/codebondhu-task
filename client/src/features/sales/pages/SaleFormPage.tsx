"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { saleService } from "../services/sale.service"
import { customerService } from "@/features/customers/services/customer.service"
import { productService } from "@/features/products/services/product.service"
import { useToast } from "@/providers/useToast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trash2, Plus } from "lucide-react"

const saleItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  sku: z.string().optional(),
  name: z.string().optional(),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Unit price must be positive"),
})

const saleSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceNo: z.string().optional().or(z.literal("")),
  items: z.array(saleItemSchema).min(1, "At least one item is required"),
  subtotal: z.coerce.number(),
  tax: z.coerce.number().default(0),
  total: z.coerce.number(),
})

type SaleForm = z.infer<typeof saleSchema>

export default function SaleFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [stockError, setStockError] = useState<string | null>(null)

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: customerService.listCustomers,
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await productService.listProducts(1, 100)
      return res.items
    },
  })

  const createMutation = useMutation({
    mutationFn: saleService.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] })
      toast({ title: "Sale created", description: "Sale has been created.", variant: "success" })
      navigate("/sales")
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SaleForm>({
    resolver: zodResolver(saleSchema) as any,
    defaultValues: {
      customerId: "",
      invoiceNo: "",
      items: [{ productId: "", sku: "", name: "", qty: 1, unitPrice: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")
  const watchedTax = watch("tax")

  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0)
    const total = subtotal + (watchedTax || 0)
    setValue("subtotal", subtotal)
    setValue("total", total)
  }, [watchedItems, watchedTax, setValue])

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p._id === productId)
    if (product) {
      setValue(`items.${index}.sku`, product.sku)
      setValue(`items.${index}.name`, product.name)
      setValue(`items.${index}.unitPrice`, product.unitPrice)
      if (product.stock < (watchedItems[index]?.qty || 1)) {
        setStockError(`Insufficient stock for ${product.name}. Available: ${product.stock}`)
      } else {
        setStockError(null)
      }
    }
  }

  const handleQtyChange = (index: number, qty: number) => {
    const productId = watchedItems[index]?.productId
    if (productId) {
      const product = products.find((p) => p._id === productId)
      if (product && qty > product.stock) {
        setStockError(`Insufficient stock for ${product.name}. Available: ${product.stock}`)
      } else {
        setStockError(null)
      }
    }
  }

  const onSubmit = (data: SaleForm) => {
    if (stockError) {
      toast({ title: "Validation Error", description: stockError, variant: "destructive" })
      return
    }
    const itemsWithTotal = data.items.map((item) => ({
      ...item,
      lineTotal: item.qty * item.unitPrice,
    }))
    createMutation.mutate({
      ...data,
      items: itemsWithTotal,
      status: "draft" as const,
      date: new Date().toISOString(),
    })
  }

  const isPending = isSubmitting || createMutation.isPending

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/sales")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Sale</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sale Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer *</Label>
                <select
                  id="customerId"
                  {...register("customerId")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Select customer...</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Invoice No.</Label>
                <Input id="invoiceNo" {...register("invoiceNo")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 md:grid-cols-12 items-end p-4 border rounded-lg">
                <div className="md:col-span-4 space-y-2">
                  <Label>Product *</Label>
                  <select
                    {...register(`items.${index}.productId`)}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku}) - Stock: {p.stock}</option>
                    ))}
                  </select>
                  {errors.items?.[index]?.productId && (
                    <p className="text-sm text-red-500">{errors.items[index]?.productId?.message}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Qty *</Label>
                  <Input
                    type="number"
                    {...register(`items.${index}.qty`)}
                    min={1}
                    onChange={(e) => handleQtyChange(index, Number(e.target.value))}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Unit Price *</Label>
                  <Input type="number" step="0.01" {...register(`items.${index}.unitPrice`)} min={0} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Line Total</Label>
                  <div className="h-9 flex items-center px-3 text-sm font-medium bg-gray-50 rounded-md border">
                    ${((watchedItems[index]?.qty || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            {stockError && (
              <p className="text-sm text-red-500 font-medium">{stockError}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ productId: "", sku: "", name: "", qty: 1, unitPrice: 0 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            {errors.items && <p className="text-sm text-red-500">{errors.items.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">${(watch("subtotal") || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-4">
              <span>Total</span>
              <span>${(watch("total") || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/sales")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !!stockError}>
            {isPending ? "Creating..." : "Create Sale"}
          </Button>
        </div>
      </form>
    </div>
  )
}
