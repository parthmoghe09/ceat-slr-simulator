"use client"

import { useEffect, useState } from "react"
import { Activity, ArrowUpCircle, KeyRound, Power, ShieldAlert, UserPlus } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"
import { toast } from "sonner"

const CATEGORY_COLOR: Record<string, string> = {
  auth: "bg-blue-500",
  feature: "bg-violet-500",
  dataset: "bg-amber-500",
  model: "bg-emerald-500",
  access: "bg-rose-500",
  provision: "bg-cyan-500",
}

function useJitteredCounter(base: number, amplitude: number) {
  const [value, setValue] = useState(base)
  useEffect(() => {
    const id = setInterval(() => {
      setValue(base + Math.round((Math.random() - 0.5) * amplitude))
    }, 2500)
    return () => clearInterval(id)
  }, [base, amplitude])
  return value
}

export function MasterDashboardView() {
  const directory = useAppStore((s) => s.directory)
  const auditLog = useAppStore((s) => s.auditLog)
  const elevateToAdmin = useAppStore((s) => s.elevateToAdmin)
  const revokeAccess = useAppStore((s) => s.revokeAccess)
  const provisionAccount = useAppStore((s) => s.provisionAccount)

  const activeSessions = useJitteredCounter(directory.filter((d) => d.status === "active").length * 3 + 12, 4)
  const tokenHealth = useJitteredCounter(98, 2)

  const [newUsername, setNewUsername] = useState("")
  const [newRole, setNewRole] = useState<UserRole>("user")

  const roleCounts = {
    user: directory.filter((d) => d.role === "user").length,
    admin: directory.filter((d) => d.role === "admin").length,
    master: directory.filter((d) => d.role === "master").length,
  }

  const activeMasters = directory.filter((d) => d.role === "master" && d.status === "active").length

  function handleProvision() {
    const trimmed = newUsername.trim()
    if (!trimmed) {
      toast.error("Enter a username.")
      return
    }
    if (!trimmed.endsWith(".rpg")) {
      toast.error("Accounts must use the domain-locked '.rpg' suffix.")
      return
    }
    if (directory.some((d) => d.username === trimmed)) {
      toast.error("An account with this username already exists.")
      return
    }
    provisionAccount(trimmed, newRole)
    toast.success(`Account ${trimmed} provisioned`)
    setNewUsername("")
    setNewRole("user")
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader title="Master Dashboard" description="Platform security flight-control center" />
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Live telemetry */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="size-4 text-primary" />
                Live Platform Telemetry
              </CardTitle>
              <CardDescription>Real-time session and token health</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Active Sessions</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">{activeSessions}</p>
                </div>
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Token Health</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">{tokenHealth}%</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium text-muted-foreground">Role distribution</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary">User: {roleCounts.user}</Badge>
                  <Badge variant="secondary">Admin: {roleCounts.admin}</Badge>
                  <Badge variant="secondary">Master: {roleCounts.master}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identity directory */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-primary" />
                Identity Directory
              </CardTitle>
              <CardDescription>Manage role settings and access across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="flex flex-col gap-1.5 pr-2">
                  {directory.map((d) => (
                    <div key={d.username} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{d.username}</span>
                        <span className="text-[11px] text-muted-foreground">
                          Last seen {new Date(d.lastSeen).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={d.status === "active" ? "secondary" : "destructive"} className="text-[10px] capitalize">
                          {d.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {d.role}
                        </Badge>
                        {d.role === "user" && d.status === "active" && (
                          <Button size="icon" variant="ghost" className="size-7" title="Elevate to Admin" onClick={() => elevateToAdmin(d.username)}>
                            <ArrowUpCircle className="size-3.5" />
                          </Button>
                        )}
                        {d.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" title="Kill switch">
                                <Power className="size-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke access for {d.username}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This immediately kills active sessions and blocks sign-in for this account.
                                  {d.role === "master" && activeMasters <= 1 && (
                                    <span className="mt-2 block font-medium text-destructive">
                                      Blocked: at least one active Master account must remain.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={d.role === "master" && activeMasters <= 1}
                                  onClick={() => revokeAccess(d.username)}
                                >
                                  Revoke Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Audit trail */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="size-4 text-primary" />
                Live Audit Trail
              </CardTitle>
              <CardDescription>Immutable record of contributions and infrastructure changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                <div className="flex flex-col gap-3 pr-2">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${CATEGORY_COLOR[entry.category] ?? "bg-muted-foreground"}`} />
                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{entry.action}</span>
                          <span className="text-[11px] text-muted-foreground">{entry.actor}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{entry.details}</p>
                        <span className="text-[10px] text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Provisioning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="size-4 text-primary" />
                Secure Provisioning
              </CardTitle>
              <CardDescription>Domain-locked account creation</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Username</Label>
                <Input placeholder="e.g. field.engineer05.rpg" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">Must use the domain-locked '.rpg' suffix.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleProvision}>Provision Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
