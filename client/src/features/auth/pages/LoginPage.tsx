import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { authService } from "@/services/auth.service"
import { useAuth } from "@/providers/AuthProvider"
import { useToast } from "@/providers/useToast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { addToast } = useToast()

  const [form, setForm] = useState({ email: "", password: "" })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.token, data.user)
      console.log(data.user.name)
      addToast({
        title: "Logged In",
        description: `Welcome ${data.user.name}`,
        variant: "success",
      })
      navigate("/")
    },
    onError: (error: any) => {
      addToast({
        title: "Login failed",
        description: error.response.data.error || "Login failed. Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.email) {
      return addToast({ title: "Validation error", description: "Email is required.", variant: "destructive" })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return addToast({ title: "Validation error", description: "Invalid email address.", variant: "destructive" })
    }
    if (!form.password) {
      return addToast({ title: "Validation error", description: "Password is required.", variant: "destructive" })
    }
    if (form.password.length < 6) {
      return addToast({ title: "Validation error", description: "Password must be at least 6 characters.", variant: "destructive" })
    }

    loginMutation.mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to Code Bondhu IT ERP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}