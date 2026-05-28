"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileSidebar } from "./MobileSidebarContext";
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
  const { isMobileOpen, closeMobileSidebar } = useMobileSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    if (isMobile) closeMobileSidebar();
  }, [pathname]);

  // Force expanded on mobile
  useEffect(() => {
    if (isMobile) setIsExpanded(true);
  }, [isMobile]);

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
    <>
    {/* Mobile backdrop overlay */}
    {isMobile && isMobileOpen && (
      <div
        onClick={closeMobileSidebar}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease",
        }}
      />
    )}
    <aside
      onMouseEnter={isMobile ? undefined : () => setIsExpanded(true)}
      onMouseLeave={isMobile ? undefined : () => setIsExpanded(false)}
      style={{
        width: isMobile ? `${EXPANDED_WIDTH}px` : (isExpanded ? `${EXPANDED_WIDTH}px` : `${COLLAPSED_WIDTH}px`),
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
        transition: isMobile ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        boxShadow: isMobile
          ? (isMobileOpen ? "4px 0 24px rgba(0, 0, 0, 0.25)" : "none")
          : (isExpanded ? "4px 0 24px rgba(0, 0, 0, 0.15)" : "none"),
        transform: isMobile ? (isMobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
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
              <Link href="/activities/visits" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/activities/visits" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/activities/visits" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Visits
                </span>
              </Link>

              <Link href="/activities/customers" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/activities/customers" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/activities/customers" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Customers
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* 5. Expenses */}
        <Link href="/expenses" style={{ textDecoration: "none" }} title="Expenses">
          <div style={getLinkStyle(pathname === "/expenses")} className="sidebar-link">
            {renderIcon(Wallet, pathname === "/expenses")}
            <span style={{
              fontSize: "13.5px",
              fontWeight: pathname === "/expenses" ? 700 : 500,
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s ease 0.05s",
            }}>Expenses</span>
          </div>
        </Link>

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
              <Link href="/insights/overview" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/insights/overview" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/insights/overview" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Overview
                </span>
              </Link>
              <Link href="/insights/attendance-analytics" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/insights/attendance-analytics" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/insights/attendance-analytics" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Attendance Analytics
                </span>
              </Link>
              <Link href="/insights/expense-audits" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/insights/expense-audits" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/insights/expense-audits" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Expense Audits
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* 7. Forms */}
        <Link href="/forms" style={{ textDecoration: "none" }} title="Forms & Feedback">
          <div style={getLinkStyle(pathname === "/forms")} className="sidebar-link">
            {renderIcon(FileText, pathname === "/forms")}
            <span style={{
              fontSize: "13.5px",
              fontWeight: pathname === "/forms" ? 700 : 500,
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s ease 0.05s",
            }}>Forms</span>
          </div>
        </Link>

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
              <Link href="/reports/travel-expenses" style={{ textDecoration: "none", color: "inherit" }}>
                <span style={{
                  fontSize: "12.5px",
                  color: pathname === "/reports/travel-expenses" ? "var(--accent-blue)" : "var(--text-secondary)",
                  fontWeight: pathname === "/reports/travel-expenses" ? 700 : 400,
                  display: "block",
                  padding: "4px 8px",
                }}>
                  ➔ Travel Expenses
                </span>
              </Link>
              <Link href="/reports/productivity" style={{ textDecoration: "none", color: "inherit" }}>
                <span style={{
                  fontSize: "12.5px",
                  color: pathname === "/reports/productivity" ? "var(--accent-blue)" : "var(--text-secondary)",
                  fontWeight: pathname === "/reports/productivity" ? 700 : 400,
                  display: "block",
                  padding: "4px 8px",
                }}>
                  ➔ Productivity Reports
                </span>
              </Link>
              <Link href="/reports/compliance" style={{ textDecoration: "none", color: "inherit" }}>
                <span style={{
                  fontSize: "12.5px",
                  color: pathname === "/reports/compliance" ? "var(--accent-blue)" : "var(--text-secondary)",
                  fontWeight: pathname === "/reports/compliance" ? 700 : 400,
                  display: "block",
                  padding: "4px 8px",
                }}>
                  ➔ Compliance Metrics
                </span>
              </Link>
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
              <Link href="/settings/user-management" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/settings/user-management" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/settings/user-management" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ User Management
                </span>
              </Link>
              <Link href="/settings/territory-setup" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/settings/territory-setup" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/settings/territory-setup" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Territory Setup
                </span>
              </Link>
              <Link href="/settings/travel-policies" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/settings/travel-policies" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/settings/travel-policies" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Travel Policies
                </span>
              </Link>
              <Link href="/settings/security-access" style={{ textDecoration: "none", color: "inherit" }}>
                <span
                  style={{
                    fontSize: "12.5px",
                    color: pathname === "/settings/security-access" ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: pathname === "/settings/security-access" ? 700 : 400,
                    display: "block",
                    padding: "4px 8px",
                  }}
                >
                  ➔ Security & Access
                </span>
              </Link>
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
    </>
  );
}
