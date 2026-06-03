import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { MobileSidebarProvider } from "@/components/layout/MobileSidebarContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileSidebarProvider>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
        <AdminSidebar />
        <div
          className="dashboard-main"
          style={{
            marginLeft: "64px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <AdminTopbar />
          <main
            className="dashboard-content"
            style={{ flex: 1, padding: "28px", animation: "fadeIn 0.4s ease" }}
          >
            {children}
          </main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
