import AuthGuard from "@/components/layout/AuthGuard";
import SidebarLayout from "@/components/layout/SidebarLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarLayout>{children}</SidebarLayout>
    </AuthGuard>
  );
}
