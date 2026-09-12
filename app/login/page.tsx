"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CircleDot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"

const ROLE_HOME: Record<UserRole, string> = {
  user: "/user/slr-prediction",
  admin: "/admin/slr-prediction",
  master: "/master/slr-prediction",
}

export default function LoginPage() {
  const router = useRouter()
  const login = useAppStore((s) => s.login)
  const auth = useAppStore((s) => s.auth)
  const hasHydrated = useAppStore((s) => s.hasHydrated)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (hasHydrated && auth) {
      router.replace(ROLE_HOME[auth.role])
    }
  }, [hasHydrated, auth, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setTimeout(() => {
      const result = login(username.trim(), password)
      setLoading(false)
      if (!result) {
        setError("Invalid username or password.")
        return
      }
      router.replace(ROLE_HOME[result.role])
    }, 400)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CircleDot className="size-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">CEAT SLR Simulator</h1>
            <p className="text-sm text-muted-foreground">AI-Driven Static Loaded Radius Prediction</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="e.g. user.rpg"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Simulated authentication for demo purposes. Contact your system administrator for access.
        </p>
      </div>
    </main>
  )
}
