"use client"

import { useState, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUsers, useCreateUser, useUpdateUserRole, useToggleUserActive } from "../hooks/useUsers"
import { DataTable } from "@/components/DataTable"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/providers/useToast"
import { Users, UserCog, UserPlus } from "lucide-react"
import type { User } from "@/types"

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  role: z.enum(["admin", "manager", "clerk"]).default("clerk"),
})

type CreateUserForm = z.infer<typeof createUserSchema>

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data: users, isLoading } = useUsers()
  const createUserMutation = useCreateUser()
  const updateRoleMutation = useUpdateUserRole()
  const toggleUserMutation = useToggleUserActive()
  const { toast } = useToast()

  const userList = users || []

  const clerkCount = userList.filter((u) => u.role === "clerk").length
  const managerCount = userList.filter((u) => u.role === "manager").length
  // const adminCount = userList.filter((u) => u.role === "admin").length

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "clerk",
    },
  })

  const handleRoleChange = useCallback(
    async (userId: string, newRole: User["role"]) => {
      try {
        await updateRoleMutation.mutateAsync({ id: userId, role: newRole })
        toast({
          title: "Role updated",
          description: "User role has been updated successfully.",
        })
      } catch {
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        })
      }
    },
    [updateRoleMutation, toast]
  )

  const handleToggleActive = useCallback(
    async (userId: string, currentStatus: boolean) => {
      try {
        await toggleUserMutation.mutateAsync({ id: userId, isActive: !currentStatus })
        toast({
          title: "Status updated",
          description: `User has been ${!currentStatus ? "activated" : "deactivated"}.`,
        })
      } catch {
        toast({
          title: "Error",
          description: "Failed to update user status.",
          variant: "destructive",
        })
      }
    },
    [toggleUserMutation, toast]
  )

  const onCreateSubmit = async (data: CreateUserForm) => {
    try {
      await createUserMutation.mutateAsync(data)
      toast({
        title: "User created",
        description: "User has been created successfully.",
        variant: "success",
      })
      reset()
      setIsCreateOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      })
    }
  }

  const columns = [
    { key: "name", header: "Name", render: (item: User) => item.name || "—" },
    { key: "email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (item: User) => (
        <Select
          value={item.role}
          onValueChange={(value) => handleRoleChange(item._id, value as User["role"])}
          disabled={updateRoleMutation.isPending || toggleUserMutation.isPending}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="clerk">Clerk</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (item: User) => (
        <button
          onClick={() => handleToggleActive(item._id, item.isActive)}
          disabled={toggleUserMutation.isPending}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${item.isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (item: User) => new Date(item.createdAt).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage users and their roles"
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Total: <span className="font-medium">{userList.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Clerks: <span className="font-medium">{clerkCount}</span>
              </span>
            </div>
            {/* <Badge variant="secondary">Admins: {adminCount}</Badge> */}
            <Badge variant="warning">Managers: {managerCount}</Badge>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="user@example.com"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="Min 6 characters"
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...register("name")} placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="clerk">Clerk</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || createUserMutation.isPending}>
                      {isSubmitting || createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <DataTable
        data={userList}
        columns={columns}
        loading={isLoading}
        emptyMessage="No users found."
        emptyIcon={<Users className="h-12 w-12 text-gray-300" />}
      />
    </div>
  )
}