import { type ReactNode } from "react"
import { createContext, useContext } from "react"
import { cn } from "@/lib/utils"

interface SkeletonContextType {
  isLoading: boolean
}

const SkeletonContext = createContext<SkeletonContextType>({ isLoading: true })

export function SkeletonProvider({ children, isLoading }: { children: ReactNode; isLoading: boolean }) {
  return (
    <SkeletonContext.Provider value={{ isLoading }}>
      {children}
    </SkeletonContext.Provider>
  )
}

export function useSkeleton() {
  return useContext(SkeletonContext)
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      <div className="flex gap-4 mb-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-2">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-10 w-1/2" />
    </div>
  )
}
