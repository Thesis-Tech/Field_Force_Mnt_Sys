"use client";
import { Bell, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Welcome back, Admin 👋" },
  "/map": { title: "Live Map", subtitle: "Real-time employee GPS tracking" },
  "/employees": { title: "Employees", subtitle: "Manage your field workforce" },
  "/tasks": { title: "Task Management", subtitle: "Assign and track field tasks" },
  "/attendance": { title: "Attendance", subtitle: "Daily check-in & check-out records" },
  "/reports": { title: "Reports", subtitle: "Analytics and performance insights" },
  "/geofencing": { title: "Geofencing Monitor", subtitle: "Live boundary tracking and containment audits" },
  "/playback": { title: "Routes Playback", subtitle: "Replay historic GPS travel timelines" },
  "/notifications": { title: "Notifications Hub", subtitle: "Central terminal for real-time operations event logs" },
};

export default function Topbar() {
  const pathname = usePathname();
  const info = pageTitles[pathname] || { title: "Field Force", subtitle: "" };

  return (
    <header style={{
      height: "70px",
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      {/* Left — Page title */}
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-hanken), sans-serif" }}>{info.title}</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, fontFamily: "'Inter', sans-serif" }}>{info.subtitle}</p>
      </div>

      {/* Right — Search + Notifications + Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Search bar */}
        <div style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            placeholder="Search operations..."
            style={{
              background: "var(--bg-hover)", border: "1px solid var(--border)",
              borderRadius: "0", padding: "8px 12px 8px 36px",
              color: "var(--text-primary)", fontSize: "13px", outline: "none",
              width: "250px", fontFamily: "Inter, sans-serif"
            }}
          />
        </div>

        {/* Notification bell */}
        <div style={{
          width: "38px", height: "38px", borderRadius: "0",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative",
        }}>
          <Bell size={18} color="var(--text-secondary)" />
          <span style={{
            position: "absolute", top: "7px", right: "7px",
            width: "8px", height: "8px", borderRadius: "0",
            background: "var(--accent-red)", border: "1px solid var(--bg-secondary)"
          }} />
        </div>

        {/* Admin avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "0",
            background: "var(--bg-hover)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px", color: "var(--text-primary)",
          }}>
            <User size={18} color="var(--text-secondary)" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Admin</span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase" }}>Global Ops</span>
          </div>
        </div>
      </div>
    </header>
  );
}
