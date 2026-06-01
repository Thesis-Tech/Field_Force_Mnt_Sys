"use client";

import { useState } from "react";
import { attendanceReportRows, performanceReportRows, reportFilters, mockManagers } from "@/lib/admin-mock-data";
import { Download, Calendar, Filter, FileText, Users, CalendarCheck, BarChart3, TrendingUp, ChevronDown, Check } from "lucide-react";

const cardStyle: React.CSSProperties = {
  background: "#f8f8faff",
  borderRadius: 16,
  border: "1px solid #c4b5fd",
  boxShadow: "0 2px 12px rgba(139,92,246,0.08)",
  padding: 24,
};

const reportTypes = [
  { id: "attendance", label: "Attendance Report", icon: <CalendarCheck size={18} />, description: "Daily/weekly/monthly attendance breakdown by department and manager.", color: "#22c55e", bg: "#dcfce7" },
  { id: "employee", label: "Employee Report", icon: <Users size={18} />, description: "Employee roster, headcount growth, department distribution.", color: "#3b82f6", bg: "#eff6ff" },
  { id: "project", label: "Project Report", icon: <BarChart3 size={18} />, description: "Project progress, assignments, timeline, budget utilization.", color: "#8b5cf6", bg: "#ede9fe" },
  { id: "performance", label: "Performance Report", icon: <TrendingUp size={18} />, description: "Manager KPIs, team productivity, task completion rates.", color: "#f97316", bg: "#fff7ed" },
];

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState("attendance");
  const [dateRange, setDateRange] = useState({ from: "2026-05-01", to: "2026-05-31" });
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedManager, setSelectedManager] = useState("All Managers");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = (format: "csv" | "pdf") => {
    showToast(`Exporting ${activeReport} report as ${format.toUpperCase()}... (demo only)`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 4px 40px", maxWidth: 1600, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Report Type Selector ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            style={{
              ...cardStyle,
              border: activeReport === r.id ? "2px solid #8b5cf6" : "1px solid #c4b5fd",
              background: activeReport === r.id ? "rgba(139,92,246,0.05)" : "#f8f8faff",
              cursor: "pointer", textAlign: "left", padding: "20px",
              boxShadow: activeReport === r.id ? "0 4px 16px rgba(139,92,246,0.15)" : "0 2px 12px rgba(139,92,246,0.08)",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", color: r.color, flexShrink: 0 }}>{r.icon}</div>
              {activeReport === r.id && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6" }} />}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>{r.description}</div>
          </button>
        ))}
      </div>

      {/* ── Filters & Export Row ── */}
      <div style={{ ...cardStyle, padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {/* Date range */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={16} color="#8b5cf6" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>From:</span>
              <input
                id="report-from-date"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none" }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>To:</span>
              <input
                id="report-to-date"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none" }}
              />
            </div>

            {/* Department filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={14} color="#94a3b8" />
              <select
                id="report-dept-filter"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", outline: "none" }}
              >
                {reportFilters.departments.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Manager filter */}
            <select
              id="report-manager-filter"
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", outline: "none" }}
            >
              {reportFilters.managers.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Export buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              id="export-csv-btn"
              onClick={() => handleExport("csv")}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              id="export-pdf-btn"
              onClick={() => handleExport("pdf")}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#8b5cf6", color: "white", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              <FileText size={15} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── Report Content ── */}
      {activeReport === "attendance" && (
        <div style={cardStyle}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Attendance Report</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Date range: {dateRange.from} → {dateRange.to}</p>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {["Date", "Department", "Present", "Absent", "Late", "Attendance Rate"].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {attendanceReportRows.filter((r) => selectedDept === "All Departments" || r.department === selectedDept).map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 13, color: "#64748b" }}>{r.date}</td>
                    <td><span style={{ background: "#ede9fe", color: "#8b5cf6", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>{r.department}</span></td>
                    <td><span style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>{r.present}</span></td>
                    <td><span style={{ color: "#ef4444", fontWeight: 700, fontSize: 13 }}>{r.absent}</span></td>
                    <td><span style={{ color: "#f97316", fontWeight: 700, fontSize: 13 }}>{r.late}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999 }}>
                          <div style={{ height: "100%", width: r.rate, background: parseFloat(r.rate) >= 85 ? "#22c55e" : "#f97316", borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", minWidth: 36 }}>{r.rate}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(139,92,246,0.06)", borderRadius: 10, border: "1px solid rgba(139,92,246,0.15)" }}>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              <strong style={{ color: "#8b5cf6" }}>Summary:</strong> Org-wide attendance averaged <strong>84%</strong> for the selected period. Field Services and Sales have the highest rates. Delivery requires attention.
            </p>
          </div>
        </div>
      )}

      {activeReport === "performance" && (
        <div style={cardStyle}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Manager Performance Report</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Date range: {dateRange.from} → {dateRange.to}</p>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {["Manager", "Department", "Tasks Completed", "Attendance Rate", "Performance Score", "Trend"].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {performanceReportRows.filter((r) => selectedManager === "All Managers" || r.manager === selectedManager).map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{r.manager}</div>
                    </td>
                    <td><span style={{ background: "#ede9fe", color: "#8b5cf6", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>{r.dept}</span></td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{r.tasksCompleted}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>{r.attendanceRate}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999 }}>
                          <div style={{ height: "100%", width: `${r.score}%`, background: r.score >= 90 ? "#22c55e" : r.score >= 75 ? "#8b5cf6" : "#f97316", borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", minWidth: 32 }}>{r.score}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                        background: r.trend === "up" ? "#dcfce7" : r.trend === "down" ? "#fee2e2" : "#f1f5f9",
                        color: r.trend === "up" ? "#16a34a" : r.trend === "down" ? "#dc2626" : "#64748b",
                      }}>
                        {r.trend === "up" ? "↑ Improving" : r.trend === "down" ? "↓ Declining" : "→ Stable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "employee" && (
        <div style={cardStyle}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Employee Report</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>Complete employee roster and stats</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Employees", value: 44, color: "#8b5cf6" },
              { label: "Active Field Employees", value: 31, color: "#22c55e" },
              { label: "Added This Month", value: 4, color: "#3b82f6" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "16px 20px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>{["Manager", "Department", "Team Size", "Active Projects", "Performance", "Status"].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {mockManagers.filter((m) => selectedDept === "All Departments" || m.department === selectedDept).map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", fontWeight: 700, fontSize: 11 }}>{m.avatar}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ background: "#ede9fe", color: "#8b5cf6", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>{m.department}</span></td>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{m.teamSize}</td>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>{m.assignedProjects}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999 }}>
                          <div style={{ height: "100%", width: `${m.performanceScore}%`, background: m.performanceScore >= 90 ? "#22c55e" : "#8b5cf6", borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{m.performanceScore}%</span>
                      </div>
                    </td>
                    <td><span style={{ background: m.status === "active" ? "#dcfce7" : "#fee2e2", color: m.status === "active" ? "#16a34a" : "#dc2626", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{m.status === "active" ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "project" && (
        <div style={cardStyle}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Project Report</h2>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0" }}>All projects with progress, budget, and timeline data</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Projects", value: 7, color: "#8b5cf6" },
              { label: "On Track", value: 4, color: "#22c55e" },
              { label: "At Risk", value: 2, color: "#f97316" },
              { label: "Completed", value: 1, color: "#3b82f6" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "16px 20px", background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.1)", borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "16px", background: "rgba(139,92,246,0.04)", borderRadius: 10, border: "1px solid rgba(139,92,246,0.15)", fontSize: 13, color: "#64748b" }}>
            <strong style={{ color: "#8b5cf6" }}>Insight:</strong> 57% of active projects are on-track. The Warehouse Ops Overhaul project is running behind schedule and needs attention. Field Service Upgrade is newly initiated and showing early progress.
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "var(--accent-green)", color: "white", padding: "12px 20px", display: "flex", alignItems: "center", gap: "10px", zIndex: 9999, animation: "fadeIn 0.2s ease", borderRadius: 8 }}>
          <Check size={16} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
