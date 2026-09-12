"use client"

// Enforces the visibility rules from the spec:
// - user only ever sees /user/*
// - admin sees /admin/* (superset of user pages, rendered inside admin/*)
// - master sees /master/* (superset of everything)
// A lower role landing on a higher segment is bounced to their own home.
// A higher role landing on a lower segment is redirected up to their own
// equivalent segment so the "hidden" higher view is never exposed via URL.

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"

const HIERARCHY: UserRole[] = ["user", "admin", "master"]

const ROLE_HOME: Record<UserRole, string> = {
  user: "/user/slr-prediction",
  admin: "/admin/slr-prediction",
  master: "/master/slr-prediction",
}

/**
 * `segment` is the role this route group ("/user/*", "/admin/*", "/master/*")
 * is built for. Any role at or above that rank in the hierarchy may view it,
 * but a higher role is transparently redirected to the equivalent path under
 * their own segment (so the existence of the higher view is never exposed
 * via a lower-ranked URL, and no role ever sees a URL above their own rank).
 */
export function RoleGuard({
  segment,
  children,
}: {
  segment: UserRole
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const auth = useAppStore((s) => s.auth)
  const hasHydrated = useAppStore((s) => s.hasHydrated)

  const segmentRank = HIERARCHY.indexOf(segment)

  useEffect(() => {
    if (!hasHydrated) return
    if (!auth) {
      router.replace("/login")
      return
    }
    const authRank = HIERARCHY.indexOf(auth.role)
    if (authRank < segmentRank) {
      router.replace(ROLE_HOME[auth.role])
    } else if (authRank > segmentRank) {
      router.replace(pathname.replace(`/${segment}/`, `/${auth.role}/`))
    }
  }, [hasHydrated, auth, segment, segmentRank, pathname, router])

  const authRank = auth ? HIERARCHY.indexOf(auth.role) : -1
  if (!hasHydrated || !auth || authRank < segmentRank || authRank > segmentRank) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return <>{children}</>
}
