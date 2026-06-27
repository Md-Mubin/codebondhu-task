import { Navigate } from "react-router-dom"
import { useAuth } from "@/providers/AuthProvider"

interface RequireRoleProps {
  allowedRoles: string[]
  children: React.ReactNode
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
