"use client"

import { Toaster as SonnerToaster } from "sonner"
import { type ReactNode } from "react"

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <SonnerToaster position="top-right" richColors/>
      {children}
    </>
  )
}