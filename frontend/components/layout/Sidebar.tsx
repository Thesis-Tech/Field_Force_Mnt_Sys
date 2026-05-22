"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MapPin, Users, ClipboardList,
  Clock, BarChart2, LogOut, Zap
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Live Map", icon: MapPin },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/attendance", label: "Attendance", icon: Clock },
  { href: "/reports", label: "Reports", icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "240px",
      minHeight: "100vh",
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "var(--accent-blue)",
            borderRadius: "0",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Zap size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", fontFamily: "var(--font-hanken), sans-serif" }}>ForceAdmin</div>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-jetbrains), monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Precision Operations</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.08em", padding: "0 8px 10px", textTransform: "uppercase" }}>
          Main Menu
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className={`sidebar-link ${active ? "active" : "inactive"}`}>
                <Icon size={18} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom logout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        <Link href="/login" style={{ textDecoration: "none" }}>
          <div className="logout-link">
            <LogOut size={18} />
            Logout
          </div>
        </Link>
      </div>
    </aside>
  );
}
