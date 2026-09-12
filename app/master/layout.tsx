import { RoleGuard } from "@/components/role-guard"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard segment="master">
      <SidebarProvider>
        <AppSidebar role="master" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
