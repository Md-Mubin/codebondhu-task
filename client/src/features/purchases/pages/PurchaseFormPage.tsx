"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { purchaseService } from "../services/purchase.service"
import { supplierService } from "@/features/suppliers/services/supplier.service"
import { productService } from "@/features/products/services/product.service"
import { useToast } from "@/providers/useToast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trash2, Plus } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const purchaseItemSchema = z.object({
  productId: z.string().optional(),
  sku: z.string().optional(),
  name: z.string().optional(),
  qty: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitCost: z.coerce.number().min(0, "Unit cost must be positive"),
}).refine((data) => {
  return (data.productId && data.productId.length > 0) || (data.sku && data.sku.length > 0 && data.name && data.name.length > 0);
}, {
  message: "Either select a product or provide both SKU and name",
  path: ["productId"],
})

const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  invoiceNo: z.string().optional().or(z.literal("")),
  items: z.array(purchaseItemSchema).min(1, "At least one item is required"),
  subtotal: z.coerce.number(),
  tax: z.coerce.number().default(0),
  total: z.coerce.number(),
})

type PurchaseForm = z.infer<typeof purchaseSchema>

export default function PurchaseFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [showProductFields, setShowProductFields] = useState<Record<number, boolean>>({})

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierService.listSuppliers,
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await productService.listProducts(1, 100)
      return res.items
    },
  })

  const createMutation = useMutation({
    mutationFn: purchaseService.createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
      toast({ title: "Purchase created", description: "Purchase order has been created.", variant: "success" })
      navigate("/purchases")
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    },
  })

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<PurchaseForm>({
    resolver: zodResolver(purchaseSchema) as any,
    defaultValues: {
      supplierId: "",
      invoiceNo: "",
      items: [{ productId: "", sku: "", name: "", qty: 1, unitCost: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    setShowProductFields({ 0: true })
  }, [])

  const watchedItems = watch("items")
  const watchedTax = watch("tax")

  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.qty * item.unitCost), 0)
    const total = subtotal + (watchedTax || 0)
    setValue("subtotal", subtotal)
    setValue("total", total)
  }, [watchedItems, watchedTax, setValue])

  const handleProductChange = (index: number, productId: string) => {
    if (productId) {
      const product = products.find((p) => p._id === productId)
      if (product) {
        setValue(`items.${index}.sku`, product.sku)
        setValue(`items.${index}.name`, product.name)
        setValue(`items.${index}.unitCost`, product.costPrice)
      }
    }
    setShowProductFields(prev => ({ ...prev, [index]: productId === "" }))
  }

  const onSubmit = (data: PurchaseForm) => {
    const itemsWithTotal = data.items.map((item) => ({
      ...item,
      lineTotal: item.qty * item.unitCost,
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
        <Button variant="ghost" size="sm" onClick={() => navigate("/purchases")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Purchase</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier *</Label>
                <select
                  id="supplierId"
                  {...register("supplierId")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
                {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId.message}</p>}
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
                  <Label>Product {showProductFields[index] ? "(enter new)" : "(select)"}</Label>
                  <select
                    {...register(`items.${index}.productId`)}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">-- New Product --</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  {showProductFields[index] && (
                    <>
                      <Input
                        placeholder="SKU *"
                        {...register(`items.${index}.sku`)}
                        className="mt-2"
                      />
                      <Input
                        placeholder="Product Name *"
                        {...register(`items.${index}.name`)}
                        className="mt-2"
                      />
                    </>
                  )}
                  {!showProductFields[index] && watchedItems[index]?.productId && (
                    <p className="text-xs text-gray-500 mt-1">
                      {watchedItems[index]?.name || "Existing product selected"}
                    </p>
                  )}
                  {errors.items?.[index]?.productId && (
                    <p className="text-sm text-red-500">{errors.items[index]?.productId?.message}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Qty *</Label>
                  <Input type="number" {...register(`items.${index}.qty`)} min={1} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Unit Cost *</Label>
                  <Input type="number" step="0.01" {...register(`items.${index}.unitCost`)} min={0} />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Line Total</Label>
                  <div className="h-9 flex items-center px-3 text-sm font-medium bg-gray-50 rounded-md border">
                    ${((watchedItems[index]?.qty || 0) * (watchedItems[index]?.unitCost || 0)).toFixed(2)}
                  </div>
                </div>
                <div className="md:col-span-1">
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newIndex = fields.length
                append({ productId: "", sku: "", name: "", qty: 1, unitCost: 0 })
                setShowProductFields(prev => ({ ...prev, [newIndex]: true }))
              }}
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
            <div className="grid gap-4 md:grid-cols-2 max-w-xs">
              <div className="space-y-2">
                <Label htmlFor="tax">Tax</Label>
                <Input id="tax" type="number" step="0.01" {...register("tax")} />
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-4">
              <span>Total</span>
              <span>${(watch("total") || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/purchases")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Purchase"}
          </Button>
        </div>
      </form>
    </div>
  )
}