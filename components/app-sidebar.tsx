"use client"

import { usePathname, useRouter } from "next/navigation"
import { Gauge, SlidersHorizontal, Database, BrainCircuit, ShieldCheck, LogOut, CircleDot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import type { UserRole } from "@/lib/sample-data"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

function getNavItems(role: UserRole): NavItem[] {
  const base: NavItem[] = [
    { title: "SLR Prediction", href: `/${role}/slr-prediction`, icon: Gauge },
    { title: "What-If Analysis", href: `/${role}/what-if`, icon: SlidersHorizontal },
  ]
  if (role === "admin" || role === "master") {
    base.push(
      { title: "Data Versioning", href: `/${role}/data-versioning`, icon: Database },
      { title: "Model Versioning", href: `/${role}/model-versioning`, icon: BrainCircuit },
    )
  }
  if (role === "master") {
    base.push({ title: "Master Dashboard", href: `/master/dashboard`, icon: ShieldCheck })
  }
  return base
}

const ROLE_LABEL: Record<UserRole, string> = {
  user: "",
  admin: "Admin View",
  master: "Master View",
}

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAppStore((s) => s.logout)
  const auth = useAppStore((s) => s.auth)
  const items = getNavItems(role)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-0 border-b px-3 py-3">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CircleDot className="size-4.5" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold leading-tight">CEAT SLR Simulator</span>
            <span className="truncate text-[11px] leading-tight text-muted-foreground">AI-Driven SLR Prediction</span>
          </div>
        </div>
        {ROLE_LABEL[role] && (
          <Badge variant="secondary" className="mt-2 w-fit group-data-[collapsible=icon]:hidden">
            {ROLE_LABEL[role]}
          </Badge>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={active} tooltip={item.title} onClick={() => router.push(item.href)}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-medium">{auth?.username}</span>
                <span className="truncate text-[11px] capitalize text-muted-foreground">{role} account</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout()
                router.replace("/login")
              }}
              tooltip="Sign out"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
