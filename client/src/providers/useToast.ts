"use client"

import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

function useToast() {
  const addToast = (options: ToastOptions) => {
    const { title, description, variant = "default" } = options
    if (variant === "destructive") {
      sonnerToast.error(title, { description })
    } else if (variant === "success") {
      sonnerToast.success(title, { description })
    } else {
      sonnerToast(title, { description })
    }
  }

  return { toasts: [], addToast, toast: addToast, removeToast: () => {} }
}

export { useToast }