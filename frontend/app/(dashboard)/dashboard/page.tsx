"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Plus,
  Compass
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

const PIE_COLORS = ["#22d3a5", "#f43f5e", "#f97316"];

export default function DashboardPage() {
  const router = useRouter();
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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifFilter, setNotifFilter] = useState<"all" | "alert" | "task" | "attendance">("all");

  // Simulation state kept as-is (no UI)
  const [simEmployeeId, setSimEmployeeId] = useState("1");
  const [simEventType, setSimEventType] = useState<"checkin" | "task" | "late" | "geofence">("checkin");

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

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === "all") return true;
    return n.type === notifFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const totalTasks = reduxTasks.length;

  return (
    <div className="flex flex-col gap-5 p-1">

      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Staff */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-1">
          <span className="text-sm text-gray-500">Total Staff</span>
          <span className="text-3xl font-bold text-gray-900">{employees.length}</span>
          <span className="text-xs text-gray-400">Registered employees</span>
        </div>

        {/* Present Today */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-1">
          <span className="text-sm text-gray-500">Present Today</span>
          <span className="text-3xl font-bold text-green-600">{mockStats.presentToday}</span>
          <span className="text-xs text-gray-400">Checked in so far</span>
        </div>

        {/* Absent Today */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-1">
          <span className="text-sm text-gray-500">Absent Today</span>
          <span className="text-3xl font-bold text-red-500">{mockStats.absentToday}</span>
          <span className="text-xs text-gray-400">No check-in recorded</span>
        </div>

        {/* Tasks Today */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-1">
          <span className="text-sm text-gray-500">Tasks Today</span>
          <span className="text-3xl font-bold text-blue-600">{totalTasks}</span>
          <span className="text-xs text-gray-400">Assigned across all staff</span>
        </div>
      </div>

      {/* ── Row 2: Task Status + Attendance Operations ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Task Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Task Status</span>
            <span className="text-xs text-gray-400">{totalTasks} total</span>
          </div>

          {/* Completed */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{completed}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: totalTasks ? `${(completed / totalTasks) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* In Progress */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-blue-600">{inProgress}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: totalTasks ? `${(inProgress / totalTasks) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* Pending */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-orange-500">{pending}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-orange-400 h-1.5 rounded-full"
                style={{ width: totalTasks ? `${(pending / totalTasks) * 100}%` : "0%" }}
              />
            </div>
          </div>

          <button
            onClick={() => router.push("/tasks")}
            className="mt-1 w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100"
          >
            View All Tasks
          </button>
        </div>

        {/* Attendance Operations */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <span className="text-sm font-semibold text-gray-700">Attendance Operations</span>

          <button
            onClick={() => router.push("/attendance")}
            className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            View Attendance Roster
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/map")}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100"
            >
              <Compass size={15} className="text-blue-500" />
              Live Map
            </button>
            <button
              onClick={() => router.push("/playback")}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100"
            >
              <Activity size={15} className="text-purple-500" />
              Route History
            </button>
            <button
              onClick={() => router.push("/employees")}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100"
            >
              <Users size={15} className="text-green-500" />
              Staff Cards
            </button>
            <button
              onClick={() => router.push("/geofencing")}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100"
            >
              <CheckCircle size={15} className="text-orange-500" />
              Geofences
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3: Bar Chart + Notifications ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Daily Tasks Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-700">Daily Tasks</p>
            <p className="text-xs text-gray-400">Tasks assigned per day</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px" }} />
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
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Notifications</p>
              <p className="text-xs text-gray-400">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 font-medium flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={clearAll}
                className="text-xs text-red-500 font-medium flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "attendance", "task", "alert"] as const).map(f => (
              <button
                key={f}
                onClick={() => setNotifFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  notifFilter === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-48 pr-1">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleRead(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border ${
                    item.read
                      ? "bg-white border-gray-100"
                      : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug ${item.read ? "text-gray-500 font-normal" : "text-gray-800 font-medium"}`}>
                      {item.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                  {!item.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                <Bell size={22} className="opacity-40" />
                <span className="text-xs">No notifications</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}