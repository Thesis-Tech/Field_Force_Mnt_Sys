"use client";

import { useRouter } from "next/navigation";
import {
  adminKPIs,
  employeeDistributionData,
  attendanceTrendData,
  projectStatusData,
  managerPerformanceData,
  mockManagers,
} from "@/lib/admin-mock-data";
import {
  Users, UserCheck, Briefcase, CalendarCheck, Clock, MapPin,
  TrendingUp, TrendingDown, UserPlus, FolderPlus, BarChart3, FileText, Shield,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

/* ── Shared card styles ── */
const cardStyle: React.CSSProperties = {
  background: "#f8f8faff",
  borderRadius: 16,
  border: "1px solid #c4b5fd",
  boxShadow: "0 2px 12px rgba(139,92,246,0.08)",
  padding: 24,
  display: "flex",
  flexDirection: "column",
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const kpiCards = [
    { icon: <Users size={22} />, iconBg: "#ede9fe", iconColor: "#8b5cf6", label: "TOTAL MANAGERS", value: adminKPIs.totalManagers, trend: "up" as const, trendText: "1 added this month" },
    { icon: <UserCheck size={22} />, iconBg: "#ecfdf5", iconColor: "#10b981", label: "TOTAL EMPLOYEES", value: adminKPIs.totalEmployees, trend: "up" as const, trendText: "4 added this month" },
    { icon: <Briefcase size={22} />, iconBg: "#eff6ff", iconColor: "#3b82f6", label: "ACTIVE PROJECTS", value: adminKPIs.activeProjects, trend: "stable" as const, trendText: "Same as last month" },
    { icon: <CalendarCheck size={22} />, iconBg: "#f0fdf4", iconColor: "#22c55e", label: "TODAY'S ATTENDANCE", value: `${adminKPIs.todayAttendancePct}%`, trend: "up" as const, trendText: "6% from yesterday" },
    { icon: <Clock size={22} />, iconBg: "#fff7ed", iconColor: "#f97316", label: "PENDING APPROVALS", value: adminKPIs.pendingApprovals, trend: "down" as const, trendText: "3 less than yesterday" },
    { icon: <MapPin size={22} />, iconBg: "#fdf4ff", iconColor: "#a855f7", label: "ACTIVE FIELD EMP.", value: adminKPIs.activeFieldEmployees, trend: "up" as const, trendText: "5% from yesterday" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 4px 40px", maxWidth: 1600, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ════ ROW 1 — KPI Cards ════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
        {kpiCards.map((kpi) => (
          <AdminKpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ════ ROW 2 — Employee Dist | Attendance Trend ════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>

        {/* ── Employee Distribution Donut ── */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Employee Distribution</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>By department</p>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={employeeDistributionData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                    {employeeDistributionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>44</span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Total</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {employeeDistributionData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Attendance Trend Area Chart ── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Attendance Trend <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>(Last 7 Weeks)</span></h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.08)", padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(139,92,246,0.2)" }}>
              <TrendingUp size={14} color="#8b5cf6" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#8b5cf6" }}>+13% overall</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" domain={[60, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} formatter={(v: any) => [`${v}%`, "Attendance"]} />
                <Area type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#attendGrad)" dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ════ ROW 3 — Project Status | Manager Performance | Quick Actions ════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 20 }}>

        {/* ── Project Status Donut ── */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Project Status</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>Overview</p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 160, height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={projectStatusData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                    {projectStatusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>7</span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Projects</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", marginTop: 12 }}>
              {projectStatusData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500, flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Manager Performance Bar ── */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Manager Performance Summary</h3>
            <button onClick={() => router.push("/admin/managers")} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "#8b5cf6", cursor: "pointer" }}>View All</button>
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerPerformanceData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={70} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} formatter={(v: any) => [`${v}%`, "Score"]} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
            <AdminQuickBtn icon={<UserPlus size={22} />} bg="#ede9fe" color="#8b5cf6" label="Add Manager" onClick={() => router.push("/admin/managers")} />
            <AdminQuickBtn icon={<FolderPlus size={22} />} bg="#eff6ff" color="#3b82f6" label="New Project" onClick={() => router.push("/admin/projects")} />
            <AdminQuickBtn icon={<BarChart3 size={22} />} bg="#ecfdf5" color="#10b981" label="Analytics" onClick={() => router.push("/admin/analytics")} />
            <AdminQuickBtn icon={<FileText size={22} />} bg="#fff7ed" color="#f97316" label="Reports" onClick={() => router.push("/admin/reports")} />
          </div>
        </div>
      </div>

      {/* ════ ROW 4 — Top Managers Table ════ */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Top Performing Managers</h3>
          <button onClick={() => router.push("/admin/managers")} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "#8b5cf6", cursor: "pointer" }}>View All Managers</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {["Manager", "Department", "Team Size", "Projects", "Performance", "Status"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockManagers.slice(0, 4).map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{m.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{m.department}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{m.teamSize}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{m.assignedProjects}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${m.performanceScore}%`, background: m.performanceScore >= 90 ? "#22c55e" : m.performanceScore >= 75 ? "#8b5cf6" : "#f97316", borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", minWidth: 32 }}>{m.performanceScore}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: m.status === "active" ? "#dcfce7" : "#fee2e2", color: m.status === "active" ? "#16a34a" : "#dc2626", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
                      {m.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function AdminKpiCard({ icon, iconBg, iconColor, label, value, trend, trendText }: {
  icon: React.ReactNode; iconBg: string; iconColor: string; label: string;
  value: number | string; trend: "up" | "down" | "stable"; trendText: string;
}) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  return (
    <div style={{ background: "#f8f8faff", borderRadius: 16, border: "1px solid #c4b5fd", boxShadow: "0 2px 12px rgba(139,92,246,0.08)", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0 }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
        {isUp ? <TrendingUp size={14} color="#22c55e" /> : isDown ? <TrendingDown size={14} color="#ef4444" /> : <span style={{ width: 14, height: 14, display: "inline-block" }}>—</span>}
        <span style={{ fontWeight: 600, color: isUp ? "#22c55e" : isDown ? "#ef4444" : "#94a3b8" }}>{trendText}</span>
      </div>
    </div>
  );
}

function AdminQuickBtn({ icon, bg, color, label, onClick }: { icon: React.ReactNode; bg: string; color: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, cursor: "pointer", transition: "all .15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color }}>{icon}</div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{label}</span>
    </button>
  );
}
