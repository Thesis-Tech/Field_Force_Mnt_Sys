"use client";

import {
  employeeGrowthData, orgAttendanceTrend, projectProgressData,
  productivityByDeptData, managerPerformanceData, employeeDistributionData,
} from "@/lib/admin-mock-data";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Users, CalendarCheck, Briefcase, TrendingUp } from "lucide-react";

const cardStyle: React.CSSProperties = {
  background: "#f8f8faff",
  borderRadius: 16,
  border: "1px solid #c4b5fd",
  boxShadow: "0 2px 12px rgba(139,92,246,0.08)",
  padding: 24,
  display: "flex",
  flexDirection: "column",
};

const summaryKPIs = [
  { label: "Headcount Growth", value: "+12", sub: "Employees added since Jan", icon: <Users size={20} />, color: "#8b5cf6", bg: "#ede9fe" },
  { label: "Avg. Attendance", value: "82%", sub: "Org-wide monthly average", icon: <CalendarCheck size={20} />, color: "#22c55e", bg: "#dcfce7" },
  { label: "Project Completion", value: "14%", sub: "1 of 7 projects completed", icon: <Briefcase size={20} />, color: "#3b82f6", bg: "#eff6ff" },
  { label: "Productivity Index", value: "81/100", sub: "Org-wide average score", icon: <TrendingUp size={20} />, color: "#f97316", bg: "#fff7ed" },
];

export default function AdminAnalyticsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 4px 40px", maxWidth: 1600, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── KPI Summary Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {summaryKPIs.map((kpi) => (
          <div key={kpi.label} style={{ ...cardStyle, padding: "18px 20px", flexDirection: "row", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color, flexShrink: 0 }}>{kpi.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{kpi.label}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Employee Growth + Distribution ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Employee Growth Area */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Employee Growth</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>Headcount over the last 6 months</p>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={employeeGrowthData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[25, 50]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} />
                <Area type="monotone" dataKey="employees" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#empGrad)" dot={{ r: 4, fill: "#8b5cf6" }} activeDot={{ r: 6 }} name="Employees" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Distribution */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Employee Distribution</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px" }}>By department</p>
          <div style={{ position: "relative", width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={employeeDistributionData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                  {employeeDistributionData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>44</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Total</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {employeeDistributionData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Attendance Trend ── */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Attendance Analytics</h3>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>Monthly breakdown — Present, Absent, Late (% of workforce)</p>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={orgAttendanceTrend} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} formatter={(v: any, name: any) => [`${v}%`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="late" name="Late" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: Project Progress + Productivity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Project Progress */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Project Progress</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>Current completion % per project</p>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={110} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} formatter={(v: any) => [`${v}%`, "Progress"]} />
                <Bar dataKey="progress" radius={[0, 6, 6, 0]} barSize={14} fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity by Dept */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Productivity by Department</h3>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>Performance index (0–100)</p>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityByDeptData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} formatter={(v: any) => [v, "Score"]} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={36} fill="#6d28d9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 5: Manager Performance ── */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>Manager Performance Analytics</h3>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>Comparative performance scores across all managers</p>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={managerPerformanceData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[50, 100]} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} formatter={(v: any) => [`${v}%`, "Score"]} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={48}>
                {managerPerformanceData.map((entry, index) => (
                  <Cell key={index} fill={entry.score >= 90 ? "#22c55e" : entry.score >= 80 ? "#8b5cf6" : entry.score >= 70 ? "#3b82f6" : "#f97316"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
          {[{ color: "#22c55e", label: "Excellent (90+)" }, { color: "#8b5cf6", label: "Good (80-89)" }, { color: "#3b82f6", label: "Average (70-79)" }, { color: "#f97316", label: "Needs Attention (<70)" }].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: 12, color: "#64748b" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
