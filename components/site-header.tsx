"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 text-card-foreground">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate text-sm font-semibold leading-tight text-foreground">{title}</h1>
          {description && <p className="truncate text-xs text-muted-foreground leading-tight">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
      </div>
    </header>
  )
}

