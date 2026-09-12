import { RoleGuard } from "@/components/role-guard"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard segment="admin">
      <SidebarProvider>
        <AppSidebar role="admin" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
