"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { mockChartData, mockRecentActivity, mockStats } from "@/lib/mock-data";
import { Users, CheckCircle, XCircle, ClipboardList, Activity, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const StatCard = ({ icon: Icon, label, value, color, sub }: { icon: any; label: string; value: number | string; color: string; sub?: string }) => (
  <div className="card fade-in" style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
    <div style={{
      width: "48px", height: "48px", borderRadius: "0",
      background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--accent-green)", marginTop: "4px" }}>{sub}</div>}
    </div>
  </div>
);

const PIE_COLORS = ["#22d3a5", "#f43f5e", "#f97316"];

export default function DashboardPage() {
  const employees = useSelector((s: RootState) => s.employees.list);
  const tasks = useSelector((s: RootState) => s.tasks.list);

  const completed = tasks.filter(t => t.status === "completed").length;
  const inProgress = tasks.filter(t => t.status === "in-progress").length;
  const pending = tasks.filter(t => t.status === "pending").length;

  const pieData = [
    { name: "Present", value: mockStats.presentToday },
    { name: "Absent", value: mockStats.absentToday },
    { name: "Late", value: 2 },
  ];

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <StatCard icon={Users} label="Total Employees" value={employees.length} color="#4f8ef7" sub="↑ 2 this month" />
        <StatCard icon={CheckCircle} label="Present Today" value={mockStats.presentToday} color="#22d3a5" sub="75% attendance" />
        <StatCard icon={XCircle} label="Absent Today" value={mockStats.absentToday} color="#f43f5e" />
        <StatCard icon={ClipboardList} label="Tasks Today" value={tasks.length} color="#a78bfa" sub={`${completed} completed`} />
      </div>

      {/* Second stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>✅ Completed</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#22d3a5" }}>{completed}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>🔄 In Progress</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#4f8ef7" }}>{inProgress}</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "6px" }}>⏳ Pending</div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#f97316" }}>{pending}</div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {/* Area Chart - Weekly Attendance */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px" }}>Weekly Attendance</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Present vs Absent this week</div>
            </div>
            <TrendingUp size={18} color="var(--accent-green)" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3a5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3a5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0", color: "var(--text-primary)" }} />
              <Area type="monotone" dataKey="present" stroke="#22d3a5" fill="url(#presentGrad)" strokeWidth={2} name="Present" />
              <Area type="monotone" dataKey="absent" stroke="#f43f5e" fill="url(#absentGrad)" strokeWidth={2} name="Absent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Today's attendance breakdown */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Today's Attendance</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Breakdown by status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0" }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: "12px", color: "var(--text-secondary)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks bar chart + Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Bar Chart */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>Daily Tasks</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>Tasks assigned per day</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockChartData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "0", color: "var(--text-primary)" }} />
              <Bar dataKey="tasks" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="Tasks" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f8ef7" />
                  <stop offset="100%" stopColor="#7c5ffc" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Activity size={16} color="var(--accent-blue)" />
            <div style={{ fontWeight: 700, fontSize: "15px" }}>Recent Activity</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {mockRecentActivity.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "0", flexShrink: 0,
                  background: item.type === "checkin" ? "rgba(34,211,165,0.12)" : item.type === "task" ? "rgba(79,142,247,0.12)" : item.type === "late" ? "rgba(249,115,22,0.12)" : "rgba(244,63,94,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
                }}>
                  {item.type === "checkin" ? "✅" : item.type === "task" ? "📋" : item.type === "late" ? "⏰" : "🚫"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: 1.4 }}>{item.message}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
