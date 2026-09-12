"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"

const ROLE_HOME: Record<UserRole, string> = {
  user: "/user/slr-prediction",
  admin: "/admin/slr-prediction",
  master: "/master/slr-prediction",
}

export default function RootPage() {
  const router = useRouter()
  const auth = useAppStore((s) => s.auth)
  const hasHydrated = useAppStore((s) => s.hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return
    router.replace(auth ? ROLE_HOME[auth.role] : "/login")
  }, [hasHydrated, auth, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  )
}
