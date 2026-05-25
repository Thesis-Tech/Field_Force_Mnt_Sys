import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sidebar />
      <div style={{ marginLeft: "64px", flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <Topbar />
        <main style={{ flex: 1, padding: "28px", animation: "fadeIn 0.4s ease" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
