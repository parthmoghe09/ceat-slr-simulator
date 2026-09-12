import { RoleGuard } from "@/components/role-guard"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard segment="user">
      <SidebarProvider>
        <AppSidebar role="user" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
