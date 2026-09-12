"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function SiteHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-sm font-semibold leading-tight">{title}</h1>
        {description && <p className="truncate text-xs text-muted-foreground leading-tight">{description}</p>}
      </div>
    </header>
  )
}
