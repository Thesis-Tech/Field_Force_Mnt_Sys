"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  Users,
  CheckSquare,
  Briefcase,
  Wallet,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  MapPin,
  Lightbulb
} from "lucide-react";

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 240;

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // Accordion open states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    myTask: false,
    activities: false,
    insights: false,
    reports: false,
    settings: false,
  });

  // Automatically keep correct accordion sections open based on active path
  useEffect(() => {
    setOpenSections({
      myTask: pathname === "/tasks" || pathname === "/attendance",
      activities: pathname === "/geofencing",
      insights: pathname === "/map" || pathname === "/playback",
      reports: pathname === "/reports",
      settings: pathname === "/notifications",
    });
  }, [pathname]);

  // Close accordions when collapsing
  useEffect(() => {
    if (!isExpanded) {
      setOpenSections({
        myTask: pathname === "/tasks" || pathname === "/attendance",
        activities: pathname === "/geofencing",
        insights: pathname === "/map" || pathname === "/playback",
        reports: pathname === "/reports",
        settings: pathname === "/notifications",
      });
    }
  }, [isExpanded, pathname]);

  const toggleSection = (section: string) => {
    if (!isExpanded) return;
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Renders round icon wrapper
  const renderIcon = (Icon: any, isActive: boolean) => {
    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: isActive ? "var(--accent-blue)" : "transparent",
          border: isActive ? "none" : "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s ease",
        }}
      >
        <Icon size={15} color={isActive ? "white" : "var(--text-secondary)"} />
      </div>
    );
  };

  const getLinkStyle = (isActive: boolean): React.CSSProperties => {
    return {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: isExpanded ? "10px 12px" : "10px 0",
      justifyContent: isExpanded ? "flex-start" : "center",
      background: isActive ? "rgba(0, 82, 255, 0.06)" : "transparent",
      borderRadius: "0",
      cursor: "pointer",
      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
      transition: "all 0.2s ease",
      marginBottom: "2px",
    };
  };

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        width: isExpanded ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`,
        height: "100vh",
        maxHeight: "100vh",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxShadow: isExpanded ? "4px 0 24px rgba(0, 0, 0, 0.15)" : "none",
      }}
    >
      {/* Brand Header */}
      <div style={{
        padding: isExpanded ? "24px 20px" : "24px 0",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: isExpanded ? "flex-start" : "center",
        alignItems: "center",
        minHeight: "85px",
        transition: "padding 0.25s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Logo icon */}
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "var(--accent-blue)",
              borderRadius: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <MapPin size={18} color="white" style={{ position: "absolute", top: "6px" }} />
            <Lightbulb size={9} color="white" style={{ position: "absolute", top: "10px", zIndex: 2 }} />
          </div>
          {/* Brand text - only visible when expanded */}
          <div style={{
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? "auto" : 0,
            overflow: "hidden",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s ease 0.05s, width 0.25s ease",
          }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "16px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-hanken), sans-serif",
              }}
            >
              FieldSense
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-jetbrains), monospace",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Precision Operations
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Navigation */}
      <nav style={{ flex: 1, padding: isExpanded ? "16px 12px" : "16px 0", overflowY: "auto", transition: "padding 0.25s ease" }}>

        {/* Main Menu Subtitle */}
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            padding: isExpanded ? "0 8px 10px" : "0 0 10px",
            textTransform: "uppercase",
            textAlign: isExpanded ? "left" : "center",
            opacity: isExpanded ? 1 : 0,
            height: isExpanded ? "auto" : 0,
            overflow: "hidden",
            transition: "opacity 0.2s ease, height 0.2s ease",
          }}
        >
          Main Menu
        </div>

        {/* 1. Dashboard */}
        <Link href="/dashboard" style={{ textDecoration: "none" }} title="Dashboard">
          <div style={getLinkStyle(pathname === "/dashboard")} className="sidebar-link">
            {renderIcon(Gauge, pathname === "/dashboard")}
            <span style={{
              fontSize: "13.5px",
              fontWeight: pathname === "/dashboard" ? 700 : 500,
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s ease 0.05s",
            }}>Dashboard</span>
          </div>
        </Link>

        {/* 2. My Team (Employees) */}
        <Link href="/employees" style={{ textDecoration: "none" }} title="My Team">
          <div style={getLinkStyle(pathname === "/employees")} className="sidebar-link">
            {renderIcon(Users, pathname === "/employees")}
            <span style={{
              fontSize: "13.5px",
              fontWeight: pathname === "/employees" ? 700 : 500,
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s ease 0.05s",
            }}>My Team</span>
          </div>
        </Link>

        {/* 3. My Task Accordion */}
        <div>
          <div
            onClick={() => toggleSection("myTask")}
            style={getLinkStyle(pathname === "/tasks" || pathname === "/attendance")}
            className="sidebar-link"
            title="My Task"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: isExpanded ? "flex-start" : "center" }}>
              {renderIcon(CheckSquare, pathname === "/tasks" || pathname === "/attendance")}
              <span style={{
                fontSize: "13.5px",
                fontWeight: (pathname === "/tasks" || pathname === "/attendance") ? 700 : 500,
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? "auto" : 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "opacity 0.2s ease 0.05s",
              }}>My Task</span>
            </div>
            {isExpanded && (openSections.myTask ? (
              <ChevronDown size={14} color="var(--text-muted)" />
            ) : (
              <ChevronRight size={14} color="var(--text-muted)" />
            ))}
          </div>

          {isExpanded && openSections.myTask && (
            <div style={{ paddingLeft: "42px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px", marginTop: "4px" }}>
              <Link href="/attendance" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/attendance" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/attendance" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Attendance
                </span>
              </Link>
              <Link href="/tasks" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/tasks" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/tasks" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ My Active Tasks
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* 4. Activities Accordion */}
        <div>
          <div
            onClick={() => toggleSection("activities")}
            style={getLinkStyle(pathname === "/geofencing")}
            className="sidebar-link"
            title="Activities"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: isExpanded ? "flex-start" : "center" }}>
              {renderIcon(Briefcase, pathname === "/geofencing")}
              <span style={{
                fontSize: "13.5px",
                fontWeight: pathname === "/geofencing" ? 700 : 500,
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? "auto" : 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "opacity 0.2s ease 0.05s",
              }}>Activities</span>
            </div>
            {isExpanded && (openSections.activities ? (
              <ChevronDown size={14} color="var(--text-muted)" />
            ) : (
              <ChevronRight size={14} color="var(--text-muted)" />
            ))}
          </div>

          {isExpanded && openSections.activities && (
            <div style={{ paddingLeft: "42px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px", marginTop: "4px" }}>
              <Link href="/geofencing" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/geofencing" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/geofencing" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Geofencing Monitor
                </span>
              </Link>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Visits (Demo)
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Visit Beat Plans
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Customers
              </span>
            </div>
          )}
        </div>

        {/* 5. Expenses Placeholder */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isExpanded ? "10px 12px" : "10px 0",
              justifyContent: isExpanded ? "flex-start" : "center",
              opacity: 0.45,
              cursor: "not-allowed",
              marginBottom: "2px",
              color: "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
            title="Expenses"
          >
            {renderIcon(Wallet, false)}
            <span style={{
              fontSize: "13.5px",
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s ease 0.05s",
            }}>Expenses</span>
          </div>
        </div>

        {/* 6. Insights Accordion */}
        <div>
          <div
            onClick={() => toggleSection("insights")}
            style={getLinkStyle(pathname === "/map" || pathname === "/playback")}
            className="sidebar-link"
            title="Insights"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: isExpanded ? "flex-start" : "center" }}>
              {renderIcon(TrendingUp, pathname === "/map" || pathname === "/playback")}
              <span style={{
                fontSize: "13.5px",
                fontWeight: (pathname === "/map" || pathname === "/playback") ? 700 : 500,
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? "auto" : 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "opacity 0.2s ease 0.05s",
              }}>Insights</span>
            </div>
            {isExpanded && (openSections.insights ? (
              <ChevronDown size={14} color="var(--text-muted)" />
            ) : (
              <ChevronRight size={14} color="var(--text-muted)" />
            ))}
          </div>

          {isExpanded && openSections.insights && (
            <div style={{ paddingLeft: "42px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px", marginTop: "4px" }}>
              <Link href="/map" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/map" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/map" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Live GPS Map
                </span>
              </Link>
              <Link href="/playback" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/playback" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/playback" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Map Insights (Playback)
                </span>
              </Link>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Overview
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Attendance Analytics
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Expense Audits
              </span>
            </div>
          )}
        </div>

        {/* 7. Forms Placeholder */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isExpanded ? "10px 12px" : "10px 0",
              justifyContent: isExpanded ? "flex-start" : "center",
              opacity: 0.45,
              cursor: "not-allowed",
              marginBottom: "2px",
              color: "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
            title="Forms"
          >
            {renderIcon(FileText, false)}
            <span style={{
              fontSize: "13.5px",
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s ease 0.05s",
            }}>Forms</span>
          </div>
        </div>

        {/* 8. Reports Accordion */}
        <div>
          <div
            onClick={() => toggleSection("reports")}
            style={getLinkStyle(pathname === "/reports")}
            className="sidebar-link"
            title="Reports"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: isExpanded ? "flex-start" : "center" }}>
              {renderIcon(BarChart3, pathname === "/reports")}
              <span style={{
                fontSize: "13.5px",
                fontWeight: pathname === "/reports" ? 700 : 500,
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? "auto" : 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "opacity 0.2s ease 0.05s",
              }}>Reports</span>
            </div>
            {isExpanded && (openSections.reports ? (
              <ChevronDown size={14} color="var(--text-muted)" />
            ) : (
              <ChevronRight size={14} color="var(--text-muted)" />
            ))}
          </div>

          {isExpanded && openSections.reports && (
            <div style={{ paddingLeft: "42px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px", marginTop: "4px" }}>
              <Link href="/reports" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/reports" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/reports" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Visits & Performance
                </span>
              </Link>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Travel Expenses
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Productivity Reports
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Compliance Metrics
              </span>
            </div>
          )}
        </div>

        {/* 9. Settings Accordion */}
        <div>
          <div
            onClick={() => toggleSection("settings")}
            style={getLinkStyle(pathname === "/notifications")}
            className="sidebar-link"
            title="Settings"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, justifyContent: isExpanded ? "flex-start" : "center" }}>
              {renderIcon(Settings, pathname === "/notifications")}
              <span style={{
                fontSize: "13.5px",
                fontWeight: pathname === "/notifications" ? 700 : 500,
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? "auto" : 0,
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "opacity 0.2s ease 0.05s",
              }}>Settings</span>
            </div>
            {isExpanded && (openSections.settings ? (
              <ChevronDown size={14} color="var(--text-muted)" />
            ) : (
              <ChevronRight size={14} color="var(--text-muted)" />
            ))}
          </div>

          {isExpanded && openSections.settings && (
            <div style={{ paddingLeft: "42px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px", marginTop: "4px" }}>
              <Link href="/notifications" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/notifications" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/notifications" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Notification Settings
                </span>
              </Link>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ User Management
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Territory Setup
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Travel Policies
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", opacity: 0.5, cursor: "not-allowed", display: "block", padding: "4px 8px" }}>
                ➔ Security & Access
              </span>
            </div>
          )}
        </div>

      </nav>

      {/* Logout Row at Bottom */}
      <div style={{ padding: isExpanded ? "16px 12px" : "16px 0", borderTop: "1px solid var(--border)", transition: "padding 0.25s ease" }}>
        <Link href="/login" style={{ textDecoration: "none" }} title="Logout">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: isExpanded ? "10px 12px" : "10px 0",
              justifyContent: isExpanded ? "flex-start" : "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            className="logout-link"
          >
            <LogOut size={16} />
            <span style={{
              fontSize: "13px",
              fontWeight: 500,
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s ease 0.05s",
            }}>Logout</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
