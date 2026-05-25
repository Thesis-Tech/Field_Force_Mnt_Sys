"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, ArrowRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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

// Searchable items — pages + features
const searchablePages = [
  { label: "Dashboard", path: "/dashboard", keywords: ["home", "overview", "stats", "dashboard"] },
  { label: "Live GPS Map", path: "/map", keywords: ["map", "gps", "tracking", "location", "live"] },
  { label: "My Team — Employees", path: "/employees", keywords: ["employees", "team", "staff", "workforce", "people"] },
  { label: "Task Management", path: "/tasks", keywords: ["tasks", "assign", "work", "todo", "management"] },
  { label: "Attendance Records", path: "/attendance", keywords: ["attendance", "checkin", "checkout", "present", "absent"] },
  { label: "Reports & Analytics", path: "/reports", keywords: ["reports", "analytics", "performance", "kpi", "metrics"] },
  { label: "Geofencing Monitor", path: "/geofencing", keywords: ["geofence", "boundary", "zone", "containment", "monitor"] },
  { label: "Routes Playback", path: "/playback", keywords: ["playback", "routes", "history", "timeline", "replay"] },
  { label: "Notification Settings", path: "/notifications", keywords: ["notifications", "alerts", "settings", "bell"] },
];

interface SearchResult {
  type: "page" | "employee";
  label: string;
  sub: string;
  path: string;
}

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const info = pageTitles[pathname] || { title: "Field Force", subtitle: "" };

  const employees = useSelector((s: RootState) => s.employees.list);

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Build search results
  const getResults = (): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search pages
    for (const page of searchablePages) {
      const match =
        page.label.toLowerCase().includes(q) ||
        page.keywords.some((kw) => kw.includes(q));
      if (match) {
        results.push({ type: "page", label: page.label, sub: page.path, path: page.path });
      }
    }

    // Search employees
    for (const emp of employees) {
      const match =
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.territory.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);
      if (match) {
        results.push({
          type: "employee",
          label: emp.name,
          sub: `${emp.role} · ${emp.territory}`,
          path: "/employees",
        });
      }
    }

    return results.slice(0, 8);
  };

  const results = getResults();
  const showDropdown = isFocused && query.trim().length > 0;

  const handleSelect = (result: SearchResult) => {
    router.push(result.path);
    setQuery("");
    setIsFocused(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
    if (e.key === "Escape") {
      setIsFocused(false);
      setQuery("");
    }
  };

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
        {/* Search bar with dropdown */}
        <div ref={searchRef} style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", zIndex: 1 }} />
          <input
            id="topbar-search"
            placeholder="Search operations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleSearchKeyDown}
            style={{
              background: "var(--bg-hover)", border: "1px solid var(--border)",
              borderRadius: "0", padding: "8px 12px 8px 36px",
              color: "var(--text-primary)", fontSize: "13px", outline: "none",
              width: "250px", fontFamily: "Inter, sans-serif",
              transition: "border-color 0.15s ease",
              borderColor: isFocused ? "var(--accent-blue)" : "var(--border)",
            }}
          />

          {/* Search results dropdown */}
          {showDropdown && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              width: "320px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              zIndex: 999,
              maxHeight: "360px",
              overflowY: "auto",
            }}>
              {results.length > 0 ? (
                <>
                  {results.map((r, i) => (
                    <div
                      key={`${r.path}-${i}`}
                      onClick={() => handleSelect(r)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.1s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Type badge */}
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: r.type === "page" ? "rgba(79,142,247,0.12)" : "rgba(34,211,165,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {r.type === "page" ? (
                          <Search size={12} color="var(--accent-blue)" />
                        ) : (
                          <User size={12} color="#22d3a5" />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.label}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {r.sub}
                        </div>
                      </div>

                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "12px" }}>
                  No results for &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification bell — navigates to /notifications */}
        <div
          id="topbar-notification-bell"
          onClick={() => router.push("/notifications")}
          style={{
            width: "38px", height: "38px", borderRadius: "0",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
          title="Notification Settings"
        >
          <Bell size={18} color={pathname === "/notifications" ? "var(--accent-blue)" : "var(--text-secondary)"} />
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
