"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { mockStats, mockRecentActivity, taskOverviewData, productivityData } from "@/lib/mock-data";
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  UserPlus,
  ClipboardCheck,
  Target,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MapPin,
  ChevronDown
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

/* ── activity details lookup ── */
const activityMeta: Record<string, { name: string; action: string; target: string; location: string }> = {
  "1": { name: "John Doe", action: "checked in at Site A.", location: "Site A, New York", target: "" },
  "2": { name: "Sarah Miller", action: "marked Task #42 as pending.", location: "Main Street, New York", target: "" },
  "3": { name: "Amit Kumar", action: "completed Delivery #88.", location: "Warehouse, New Jersey", target: "" },
  "4": { name: "Rick James", action: "missed check-in window.", location: "Downtown, New York", target: "" },
  "5": { name: "Priya Lal", action: "entered geofence Zone North.", location: "Zone North", target: "" },
};

const avatarColors: Record<string, { bg: string; text: string }> = {
  JD: { bg: "#dcfce7", text: "#16a34a" },
  SM: { bg: "#ffedd5", text: "#ea580c" },
  AK: { bg: "#dbeafe", text: "#2563eb" },
  RJ: { bg: "#fee2e2", text: "#dc2626" },
  PL: { bg: "#f3e8ff", text: "#9333ea" },
};

/* ── donut data ── */
const taskStatusData = [
  { name: "Completed", value: 24, color: "#22c55e" },
  { name: "In Progress", value: 10, color: "#3b82f6" },
  { name: "Pending", value: 8, color: "#f97316" },
];

export default function DashboardPage() {
  const router = useRouter();
  const employees = useSelector((s: RootState) => s.employees.list);
  const tasks = useSelector((s: RootState) => s.tasks.list);
  const totalTasks = tasks.length || 42;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "4px 4px 40px", maxWidth: 1600, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ════ ROW 1 — KPI Cards ════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <KpiCard icon={<Users size={22} />} iconBg="#eff6ff" iconColor="#3b82f6" label="TOTAL EMPLOYEES" value={employees.length || 12} trend="up" trendText="12% from last month" />
        <KpiCard icon={<UserCheck size={22} />} iconBg="#ecfdf5" iconColor="#10b981" label="PRESENT TODAY" value={mockStats.presentToday} trend="up" trendText="8% from yesterday" />
        <KpiCard icon={<UserX size={22} />} iconBg="#fef2f2" iconColor="#ef4444" label="ABSENT TODAY" value={mockStats.absentToday} trend="down" trendText="4% from yesterday" />
        <KpiCard icon={<Briefcase size={22} />} iconBg="#faf5ff" iconColor="#8b5cf6" label="TASKS TODAY" value={totalTasks} trend="up" trendText="18% from yesterday" />
      </div>

      {/* ════ ROW 2 — Task Overview | Task Status | Quick Actions ════ */}
      <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr 3fr", gap: 20 }}>

        {/* ── Task Overview (Line Chart) ── */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Task Overview <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>(This Week)</span></h3>
            </div>
            <DropdownPill text="This Week" />
          </div>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskOverviewData} margin={{ left: -20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Completed" />
                <Line type="monotone" dataKey="inProgress" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5 }} name="In Progress" />
                <Line type="monotone" dataKey="pending" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 12 }}>
            <LegendDot color="#22c55e" label="Completed" />
            <LegendDot color="#3b82f6" label="In Progress" />
            <LegendDot color="#f97316" label="Pending" />
          </div>
        </Card>

        {/* ── Task Status (Donut) ── */}
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 8px" }}>Task Status</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
            {/* Donut */}
            <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                    {taskStatusData.map((d, i) => (<Cell key={i} fill={d.color} />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>42</span>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Total</span>
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {taskStatusData.map((d) => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginLeft: "auto" }}>{d.value}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>({Math.round(d.value / 42 * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
          {/* Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span style={{ background: "#dcfce7", color: "#16a34a", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>+18%</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>More tasks completed than yesterday</span>
          </div>
        </Card>

        {/* ── Quick Actions ── */}
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1 }}>
            <QuickBtn icon={<UserPlus size={22} />} bg="#eff6ff" color="#3b82f6" label="Add Employee" onClick={() => router.push("/employees")} />
            <QuickBtn icon={<ClipboardCheck size={22} />} bg="#faf5ff" color="#8b5cf6" label="Assign Task" onClick={() => router.push("/tasks")} />
            <QuickBtn icon={<Target size={22} />} bg="#ecfdf5" color="#10b981" label="Add Geofence" onClick={() => router.push("/geofencing")} />
            <QuickBtn icon={<BarChart3 size={22} />} bg="#fff7ed" color="#f97316" label="View Reports" onClick={() => router.push("/reports")} />
          </div>
        </Card>
      </div>

      {/* ════ ROW 3 — Live Activity | Productivity | Live Map ════ */}
      <div style={{ display: "grid", gridTemplateColumns: "4fr 5fr 3fr", gap: 20 }}>

        {/* ── Live Activity ── */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Live Activity</h3>
            <button onClick={() => router.push("/notifications")} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "#3b82f6", cursor: "pointer" }}>View All</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {mockRecentActivity.map((item) => {
              const meta = activityMeta[item.id];
              const ac = avatarColors[item.avatar] || { bg: "#f1f5f9", text: "#64748b" };
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f8fafc", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: ac.bg, color: ac.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {item.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700 }}>{meta?.name || item.employeeName}</span>{" "}
                      <span style={{ fontWeight: 400 }}>{meta?.action || item.message}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{meta?.location}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", flexShrink: 0, whiteSpace: "nowrap" }}>{item.time}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Productivity Overview (Combo Chart) ── */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Productivity Overview <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>(This Week)</span></h3>
            </div>
            <DropdownPill text="This Week" />
          </div>
          <div style={{ display: "flex", gap: 32, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Tasks Completed</span>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Completion Rate (%)</span>
          </div>
          <div style={{ width: "100%", height: 210 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={productivityData} margin={{ left: -15, right: -15, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.08)", fontSize: 13 }} />
                <Bar yAxisId="left" dataKey="tasksCompleted" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} name="Tasks Completed" />
                <Line yAxisId="right" type="monotone" dataKey="completionRate" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }} activeDot={{ r: 6 }} name="Completion Rate" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: "#3b82f6" }} />
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Tasks Completed</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 3, borderRadius: 2, background: "#3b82f6" }} />
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Completion Rate</span>
            </div>
          </div>
        </Card>

        {/* ── Live Map ── */}
        <Card noPad>
          <div style={{ padding: "16px 20px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={16} color="#3b82f6" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>Live Map</h3>
            </div>
          </div>
          {/* Map visual */}
          <div style={{ flex: 1, margin: "0 12px", borderRadius: 12, overflow: "hidden", position: "relative", background: "#f8fafc", minHeight: 220 }}>
            {/* Real Map Image */}
            <img src="/dashboard-map-bg.png" alt="Live Map" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
            {/* Pin markers */}
            {[
              { top: "22%", left: "32%", color: "#3b82f6" },
              { top: "50%", left: "58%", color: "#ef4444" },
              { top: "68%", left: "22%", color: "#22c55e" },
              { top: "35%", left: "72%", color: "#f59e0b" },
              { top: "75%", left: "65%", color: "#8b5cf6" },
            ].map((pin, i) => (
              <div key={i} style={{ position: "absolute", top: pin.top, left: pin.left, transform: "translate(-50%, -100%)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <MapPin size={20} fill={pin.color} color={pin.color} />
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: pin.color, opacity: 0.3, marginTop: -2 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 20px", textAlign: "center" }}>
            <button onClick={() => router.push("/map")} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "#3b82f6", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              View Full Map
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   Sub-components (kept in same file for simplicity)
   ════════════════════════════════════════════ */

function Card({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
  return (
    <div style={{
      background: "#f8f8faff",
      borderRadius: 16,
      border: "1px solid #6d90d1ff",
      boxShadow: "0 2px 12px rgba(48, 117, 228, 0.08)",
      padding: noPad ? 0 : 24,
      display: "flex",
      flexDirection: "column",
    }}>
      {children}
    </div>
  );
}

function KpiCard({ icon, iconBg, iconColor, label, value, trend, trendText }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; value: number; trend: "up" | "down"; trendText: string;
}) {
  const isUp = trend === "up";
  return (
    <div style={{
      background: "#f8f8faff", borderRadius: 16, border: "1px solid #92b3f1ff",
      boxShadow: "0 2px 12px rgba(48, 117, 228, 0.08)", padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor, flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
        {isUp ? <TrendingUp size={14} color="#22c55e" /> : <TrendingDown size={14} color="#ef4444" />}
        <span style={{ fontWeight: 600, color: isUp ? "#22c55e" : "#ef4444" }}>{trendText.split(" ")[0]}</span>
        <span style={{ color: "#94a3b8" }}>{trendText.split(" ").slice(1).join(" ")}</span>
      </div>
    </div>
  );
}

function QuickBtn({ icon, bg, color, label, onClick }: {
  icon: React.ReactNode; bg: string; color: string; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 10, padding: 16, cursor: "pointer", transition: "all .15s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        {icon}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{label}</span>
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function DropdownPill({ text }: { text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 999,
      padding: "6px 14px", fontSize: 13, fontWeight: 500, color: "#64748b", cursor: "pointer",
    }}>
      {text}
      <ChevronDown size={14} />
    </div>
  );
}