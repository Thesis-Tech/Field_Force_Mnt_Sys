"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { mockChartData, mockStats, mockAttendance, mockTasks } from "@/lib/mock-data";
import {
  Users,
  CheckCircle,
  XCircle,
  ClipboardList,
  Activity,
  TrendingUp,
  Bell,
  Trash2,
  Check,
  Send,
  Plus
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";

interface NotificationItem {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  type: "attendance" | "task" | "alert" | "system";
  message: string;
  time: string;
  read: boolean;
}

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
  const reduxTasks = useSelector((s: RootState) => s.tasks.list);

  const completed = reduxTasks.filter(t => t.status === "completed").length;
  const inProgress = reduxTasks.filter(t => t.status === "in-progress").length;
  const pending = reduxTasks.filter(t => t.status === "pending").length;

  const pieData = [
    { name: "Present", value: mockStats.presentToday },
    { name: "Absent", value: mockStats.absentToday },
    { name: "Late", value: 2 },
  ];

  // Dynamic Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifFilter, setNotifFilter] = useState<"all" | "alert" | "task" | "attendance">("all");
  
  // Simulation Form states
  const [simEmployeeId, setSimEmployeeId] = useState("1");
  const [simEventType, setSimEventType] = useState<"checkin" | "task" | "late" | "geofence">("checkin");

  // Load initial notifications built from employee data
  useEffect(() => {
    const list: NotificationItem[] = [
      {
        id: "n-1",
        employeeId: "1",
        employeeName: "Rahul Sharma",
        avatar: "RS",
        type: "attendance",
        message: "Rahul Sharma checked in at Mumbai North HQ",
        time: "09:02 AM",
        read: false
      },
      {
        id: "n-2",
        employeeId: "2",
        employeeName: "Priya Patel",
        avatar: "PP",
        type: "task",
        message: "Priya Patel completed delivery task 'Order #4521'",
        time: "10:30 AM",
        read: false
      },
      {
        id: "n-3",
        employeeId: "8",
        employeeName: "Ananya Roy",
        avatar: "AR",
        type: "alert",
        message: "Ananya Roy logged check-in: 1h 15m Late arrival",
        time: "10:15 AM",
        read: false
      },
      {
        id: "n-4",
        employeeId: "3",
        employeeName: "Arjun Singh",
        avatar: "AS",
        type: "alert",
        message: "Arjun Singh marked absent: No active device signal detected",
        time: "09:30 AM",
        read: true
      },
      {
        id: "n-5",
        employeeId: "4",
        employeeName: "Kavya Nair",
        avatar: "KN",
        type: "attendance",
        message: "Kavya Nair checked in at Pune West Zone",
        time: "08:55 AM",
        read: true
      }
    ];
    setNotifications(list);
  }, []);

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === "all") return true;
    return n.type === notifFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Add Dynamic Notification
  const handleAddNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === simEmployeeId) || employees[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let message = "";
    let type: "attendance" | "task" | "alert" | "system" = "system";

    if (simEventType === "checkin") {
      message = `${emp.name} checked in at ${emp.territory}`;
      type = "attendance";
    } else if (simEventType === "task") {
      // Find a task for this employee or create a standard message
      const task = reduxTasks.find(t => t.assignedTo === emp.name) || { title: "Standard Operations Log" };
      message = `${emp.name} completed task '${task.title}'`;
      type = "task";
    } else if (simEventType === "late") {
      message = `${emp.name} logged late check-in: 45m past standard hours`;
      type = "alert";
    } else if (simEventType === "geofence") {
      message = `${emp.name} breached geofence boundary at Pune Sector 10`;
      type = "alert";
    }

    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      avatar: emp.avatar,
      type,
      message,
      time: timeString,
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  // Toggle Read Status
  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  // Mark All Read
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clear All
  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <StatCard icon={Users} label="Total Employees" value={employees.length} color="#4f8ef7" sub="↑ 2 this month" />
        <StatCard icon={CheckCircle} label="Present Today" value={mockStats.presentToday} color="#22d3a5" sub="75% attendance" />
        <StatCard icon={XCircle} label="Absent Today" value={mockStats.absentToday} color="#f43f5e" />
        <StatCard icon={ClipboardList} label="Tasks Today" value={reduxTasks.length} color="#a78bfa" sub={`${completed} completed`} />
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

      {/* Task chart + Operations Notifications Hub Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Bar Chart */}
          <div className="card" style={{ flex: 1 }}>
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

          {/* Simulate Action Panel */}
          <form className="card" onSubmit={handleAddNotification} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={16} color="var(--accent-blue)" />
              <span style={{ fontWeight: 700, fontSize: "14px" }}>Simulate Field Event</span>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>EMPLOYEE</label>
                <select 
                  value={simEmployeeId} 
                  onChange={(e) => setSimEmployeeId(e.target.value)}
                  className="input"
                  style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>EVENT LOG</label>
                <select 
                  value={simEventType} 
                  onChange={(e) => setSimEventType(e.target.value as any)}
                  className="input"
                  style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
                >
                  <option value="checkin">Normal Check-In</option>
                  <option value="task">Task Completed</option>
                  <option value="late">Late Arrival Alert</option>
                  <option value="geofence">Geofence Boundary Breach</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ padding: "8px 12px", fontSize: "12px", justifyContent: "center", gap: "6px", width: "100%", height: "36px" }}
            >
              <Send size={12} /> Inject Event Log
            </button>
          </form>
        </div>

        {/* Dynamic Operations Notification Hub */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "450px" }}>
          {/* Header section with controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={16} color="var(--accent-blue)" />
                <span style={{ fontWeight: 700, fontSize: "15px" }}>Operations Notification Hub</span>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                {unreadCount} unread notices active now
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button 
                onClick={markAllRead}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-blue)", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "2px" }}
                title="Mark all read"
              >
                <Check size={12} /> Mark Read
              </button>
              <span style={{ color: "var(--border)" }}>|</span>
              <button 
                onClick={clearAll}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-red)", fontSize: "11px", fontWeight: 600, display: "flex", alignItems: "center", gap: "2px" }}
                title="Clear all notifications"
              >
                <Trash2 size={12} /> Clear All
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All" },
              { id: "attendance", label: "Attendance" },
              { id: "task", label: "Tasks" },
              { id: "alert", label: "Alerts" },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setNotifFilter(filter.id as any)}
                style={{
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  background: notifFilter === filter.id ? "var(--accent-blue)" : "var(--bg-hover)",
                  color: notifFilter === filter.id ? "white" : "var(--text-secondary)",
                  transition: "all 0.15s ease"
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Scrollable Notifications List */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleRead(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "10px",
                    cursor: "pointer",
                    background: item.read ? "var(--bg-card)" : "rgba(0, 82, 255, 0.03)",
                    border: item.read ? "1px solid var(--border)" : "1px solid rgba(0, 82, 255, 0.15)",
                    transition: "all 0.15s ease",
                    position: "relative"
                  }}
                >
                  {/* Left avatar badge */}
                  <div style={{
                    width: "32px",
                    height: "32px",
                    background: "linear-gradient(135deg, #4f8ef7, #0052ff)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {item.avatar}
                  </div>

                  {/* Message body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: "12.5px", 
                      color: item.read ? "var(--text-secondary)" : "var(--text-primary)",
                      fontWeight: item.read ? 400 : 600,
                      lineHeight: 1.4
                    }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {item.time}
                    </div>
                  </div>

                  {/* Read/Unread dot indicator */}
                  {!item.read && (
                    <div style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--accent-blue)",
                      marginTop: "6px"
                    }} />
                  )}
                </div>
              ))
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-muted)", gap: "8px" }}>
                <Bell size={24} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: "12px" }}>No operational logs matching filter.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
