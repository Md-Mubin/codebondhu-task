import { useAuth } from "@/providers/AuthProvider";
import { Navigate, Outlet } from "react-router-dom";

export function PublicRoute() {
    const { user } = useAuth();

    if (user) return <Navigate to="/" replace />
    return <Outlet />
}