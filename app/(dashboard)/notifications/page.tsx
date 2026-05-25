"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  Bell,
  Trash2,
  CheckCheck,
  Search,
  AlertTriangle,
  ClipboardList,
  Clock,
  Plus,
  Send,
  Info,
  SlidersHorizontal,
  Radio,
  Activity
} from "lucide-react";

interface NotificationItem {
  id: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  type: "attendance" | "task" | "alert" | "system";
  message: string;
  time: string;
  date: string;
  priority: "high" | "normal";
  read: boolean;
}

export default function NotificationsPage() {
  const employees = useSelector((s: RootState) => s.employees.list);
  const tasks = useSelector((s: RootState) => s.tasks.list);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "alert" | "task" | "attendance" | "system">("all");

  // Live Geofence alerts listener system state
  const [isListenerActive, setIsListenerActive] = useState(false);
  const [geofenceLogs, setGeofenceLogs] = useState<string[]>([
    "System standby. Toggle alerts receiver to monitor boundaries."
  ]);

  // Form states for creating custom notifications
  const [simEmployeeId, setSimEmployeeId] = useState("1");
  const [simEventType, setSimEventType] = useState<"checkin" | "task" | "late" | "geofence">("checkin");
  const [simPriority, setSimPriority] = useState<"high" | "normal">("normal");

  // Form states for sending outgoing broadcast notifications to employees
  const [broadcastEmpId, setBroadcastEmpId] = useState("1");
  const [broadcastTemplate, setBroadcastTemplate] = useState("custom");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastPriority, setBroadcastPriority] = useState<"high" | "normal">("normal");

  // Load initial notifications built from employee data
  useEffect(() => {
    setNotifications([
      {
        id: "notif-1",
        employeeId: "1",
        employeeName: "Rahul Sharma",
        avatar: "RS",
        type: "attendance",
        message: "Rahul Sharma checked in at Mumbai North HQ",
        time: "09:02 AM",
        date: "Today",
        priority: "normal",
        read: false
      },
      {
        id: "notif-2",
        employeeId: "2",
        employeeName: "Priya Patel",
        avatar: "PP",
        type: "task",
        message: "Priya Patel completed delivery task 'Order #4521'",
        time: "10:30 AM",
        date: "Today",
        priority: "normal",
        read: false
      },
      {
        id: "notif-3",
        employeeId: "8",
        employeeName: "Ananya Roy",
        avatar: "AR",
        type: "alert",
        message: "Ananya Roy logged check-in: 1h 15m Late arrival",
        time: "10:15 AM",
        date: "Today",
        priority: "high",
        read: false
      },
      {
        id: "notif-4",
        employeeId: "3",
        employeeName: "Arjun Singh",
        avatar: "AS",
        type: "alert",
        message: "Arjun Singh marked absent: No active device signal detected",
        time: "09:30 AM",
        date: "Today",
        priority: "high",
        read: true
      },
      {
        id: "notif-5",
        employeeId: "4",
        employeeName: "Kavya Nair",
        avatar: "KN",
        type: "attendance",
        message: "Kavya Nair checked in at Pune West Zone",
        time: "08:55 AM",
        date: "Yesterday",
        priority: "normal",
        read: true
      },
      {
        id: "notif-6",
        employeeId: "5",
        employeeName: "Suresh Yadav",
        avatar: "SY",
        type: "system",
        message: "Device Battery Warning: Suresh Yadav's terminal battery is below 15%",
        time: "04:12 PM",
        date: "Yesterday",
        priority: "high",
        read: true
      }
    ]);
  }, []);

  // Filter logic (Priority filter removed)
  const filteredList = notifications.filter((n) => {
    const matchesSearch = n.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedFilter === "all" || n.type === selectedFilter;
    return matchesSearch && matchesType;
  });

  // Summary Metrics
  const totalNotifs = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter((n) => n.priority === "high" && !n.read).length;

  // Mark all read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Clear all
  const handleClearAll = () => {
    setNotifications([]);
  };

  // Toggle single notification read status
  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  // Inject a new mock notification (Simulator)
  const handleInjectNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === simEmployeeId) || employees[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let message = "";
    let type: "attendance" | "task" | "alert" | "system" = "system";

    if (simEventType === "checkin") {
      message = `${emp.name} logged in from active coordinates near ${emp.territory}`;
      type = "attendance";
    } else if (simEventType === "task") {
      const t = tasks.find((tk) => tk.assignedTo === emp.name) || { title: "Scheduled Client Visit" };
      message = `${emp.name} submitted task update: Completed '${t.title}'`;
      type = "task";
    } else if (simEventType === "late") {
      message = `${emp.name} check-in alert: Delayed arrival recorded (Territory: ${emp.territory})`;
      type = "alert";
    } else if (simEventType === "geofence") {
      message = `Geofence BREACH: ${emp.name} exited assigned boundary ring near South Hub`;
      type = "alert";
    }

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      avatar: emp.avatar,
      type,
      message,
      time: timeString,
      date: "Today",
      priority: simPriority,
      read: false
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Send outgoing broadcast to a particular employee
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === broadcastEmpId) || employees[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let messageContent = broadcastMessage;
    if (broadcastTemplate !== "custom") {
      messageContent = broadcastTemplate;
    }

    if (!messageContent.trim()) {
      alert("Please specify a broadcast message.");
      return;
    }

    const newBroadcast: NotificationItem = {
      id: `broadcast-${Date.now()}`,
      employeeId: emp.id,
      employeeName: `SYSTEM BROADCAST ➔ ${emp.name}`,
      avatar: "SYS",
      type: "system",
      message: `Outgoing message sent to ${emp.name}: "${messageContent}"`,
      time: timeString,
      date: "Today",
      priority: broadcastPriority,
      read: true
    };

    setNotifications((prev) => [newBroadcast, ...prev]);
    setBroadcastMessage("");
    setBroadcastTemplate("custom");
    alert(`Broadcast successfully dispatched to ${emp.name}'s device!`);
  };

  // Live Geofence alerts listener simulation loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isListenerActive) {
      timer = setInterval(() => {
        if (employees.length === 0) return;

        // Select a random executive from active employees
        const randomEmp = employees[Math.floor(Math.random() * employees.length)];
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Select boundary zones
        const boundaries = [
          "Mumbai North HQ",
          "Delhi West Depot",
          "Pune West Zone Sector 4",
          "South Delivery Hub"
        ];
        const randomZone = boundaries[Math.floor(Math.random() * boundaries.length)];

        // Decide entered vs exited (50/50)
        const isEntry = Math.random() > 0.5;
        let message = "";
        let priority: "high" | "normal" = "normal";

        if (isEntry) {
          message = `🟢 GEOFENCE AUDIT: ${randomEmp.name} entered authorized corporate boundary "${randomZone}".`;
          priority = "normal";
        } else {
          message = `🔴 GEOFENCE BREACH: ${randomEmp.name} exited assigned perimeter ring "${randomZone}" without clearance!`;
          priority = "high";
        }

        const geofenceAlert: NotificationItem = {
          id: `geofence-alert-${Date.now()}`,
          employeeId: randomEmp.id,
          employeeName: randomEmp.name,
          avatar: randomEmp.avatar,
          type: "alert",
          message,
          time: timeString,
          date: "Today",
          priority,
          read: false
        };

        // Prepend to notifications feed
        setNotifications((prev) => [geofenceAlert, ...prev]);

        // Prepend to sidebar status scanner logs
        setGeofenceLogs((prev) => [
          `[${timeString}] ${randomEmp.name}: ${isEntry ? "Entered" : "Left"} ${randomZone.slice(0, 10)}...`,
          ...prev.slice(0, 3)
        ]);

      }, 6000); // Audit every 6 seconds
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isListenerActive, employees]);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(0,82,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={18} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{totalNotifs} Logs</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Operations Logs</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(249,115,22,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SlidersHorizontal size={18} color="var(--accent-orange)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{unreadCount} Unread</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pending Review</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ width: "42px", height: "42px", background: "rgba(244,63,94,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={18} color="var(--accent-red)" />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: 800 }}>{highPriorityCount} Alerts</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Critical Unread Alerts</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Deck + Notification list */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", alignItems: "start" }}>
        
        {/* Left Side: Simulation & Filters */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Live Geofence Boundary Monitor Receiver */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", border: isListenerActive ? "1px solid var(--accent-green)" : "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Radio size={16} color={isListenerActive ? "var(--accent-green)" : "var(--text-muted)"} className={isListenerActive ? "pulse-dot" : ""} />
                <span style={{ fontWeight: 700, fontSize: "14px" }}>Perimeter Alerts</span>
              </div>
              <span className={`badge ${isListenerActive ? "badge-green" : "badge-red"}`} style={{ fontSize: "9px", padding: "1px 6px" }}>
                {isListenerActive ? "ACTIVE SCAN" : "STANDBY"}
              </span>
            </div>

            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0 }}>
              Listen for automated entrance and breach warnings when field executives cross geofenced boundaries.
            </p>

            <button
              onClick={() => {
                setIsListenerActive(!isListenerActive);
                setGeofenceLogs(prev => [
                  `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] Alerts listener toggled ${!isListenerActive ? "ON" : "OFF"}.`,
                  ...prev.slice(0, 2)
                ]);
              }}
              className="btn-primary"
              style={{
                background: isListenerActive ? "var(--accent-orange)" : "var(--accent-green)",
                height: "36px",
                fontSize: "12.5px",
                justifyContent: "center",
                gap: "6px"
              }}
            >
              {isListenerActive ? "Deactivate Alerts" : "Activate Alerts"}
            </button>

            {/* Scrollable Mono terminal */}
            <div style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              padding: "10px",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: "10px",
              minHeight: "75px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              color: isListenerActive ? "var(--text-primary)" : "var(--text-muted)"
            }}>
              {geofenceLogs.map((log, index) => (
                <div key={index} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch/Send Broadcast Console */}
          <form className="card" onSubmit={handleSendBroadcast} style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid var(--accent-blue)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <Bell size={16} color="var(--accent-blue)" />
              <span style={{ fontWeight: 700, fontSize: "14px" }}>Send Outgoing Notification</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>TARGET EMPLOYEE</label>
              <select 
                value={broadcastEmpId}
                onChange={(e) => setBroadcastEmpId(e.target.value)}
                className="input"
                style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>MESSAGE TEMPLATE</label>
              <select 
                value={broadcastTemplate}
                onChange={(e) => setBroadcastTemplate(e.target.value)}
                className="input"
                style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
              >
                <option value="custom">-- Custom Message Below --</option>
                <option value="Report to corporate headquarters immediately for briefing.">Report to Corporate HQ</option>
                <option value="A high-priority field ticket has been assigned to your queue.">High-priority Task Assigned</option>
                <option value="Check battery levels: Your mobile tracker shows critical battery charge.">Critical Battery Warning</option>
                <option value="Urgent GPS mismatch: Please verify that location services are active.">GPS Mismatch Verification</option>
              </select>
            </div>

            {broadcastTemplate === "custom" && (
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>CUSTOM MSG BODY</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter message text..."
                  className="input"
                  rows={2}
                  style={{ fontSize: "12px", resize: "none", padding: "8px" }}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>BROADCAST PRIORITY</label>
              <select 
                value={broadcastPriority}
                onChange={(e) => setBroadcastPriority(e.target.value as any)}
                className="input"
                style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
              >
                <option value="normal">Normal Broadcast</option>
                <option value="high">Critical Alert Broadcast</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", height: "38px", fontSize: "13px", marginTop: "4px" }}
            >
              <Send size={13} /> Dispatch Notification
            </button>
          </form>

          {/* Simulator Console */}
          <form className="card" onSubmit={handleInjectNotification} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
              <Plus size={16} color="var(--accent-orange)" />
              <span style={{ fontWeight: 700, fontSize: "14px" }}>Simulate Incoming Event</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>FIELD EXECUTIVE</label>
              <select 
                value={simEmployeeId}
                onChange={(e) => setSimEmployeeId(e.target.value)}
                className="input"
                style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>OPERATIONS LOG</label>
              <select 
                value={simEventType}
                onChange={(e) => setSimEventType(e.target.value as any)}
                className="input"
                style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
              >
                <option value="checkin">Normal Check-in</option>
                <option value="task">Task Completion</option>
                <option value="late">Late Check-in Alert</option>
                <option value="geofence">Geofence Boundary Breach</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>SEVERITY LEVEL</label>
              <select 
                value={simPriority}
                onChange={(e) => setSimPriority(e.target.value as any)}
                className="input"
                style={{ fontSize: "12px", height: "36px", padding: "4px 8px" }}
              >
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority (CRITICAL)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", height: "38px", fontSize: "13px", marginTop: "4px" }}
            >
              <Send size={13} /> Trigger Simulated Event
            </button>
          </form>
        </div>

        {/* Right Side: Notification list display */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Action Header controls */}
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              
              {/* Consolidated Search & Filters Row (Priority filter removed) */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flex: 1, minWidth: "300px" }}>
                {/* Search bar */}
                <div style={{ position: "relative", flex: "3 1 250px", minWidth: "150px" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "11px", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                    style={{ paddingLeft: "32px", fontSize: "12px", height: "34px" }}
                  />
                </div>

                {/* Log Category Filter Dropdown */}
                <div style={{ flex: "1 1 150px", minWidth: "130px" }}>
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as any)}
                    className="input"
                    style={{ fontSize: "12px", height: "34px", padding: "4px 8px" }}
                  >
                    <option value="all">📂 All Categories</option>
                    <option value="attendance">✅ Attendance Logs</option>
                    <option value="task">📋 Task Updates</option>
                    <option value="alert">⚠️ Alert Warnings</option>
                    <option value="system">⚙️ System Metrics</option>
                  </select>
                </div>
              </div>

              {/* Bulk operations */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={handleMarkAllRead}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-blue)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <CheckCheck size={14} /> Mark all Read
                </button>
                <span style={{ color: "var(--border)" }}>|</span>
                <button
                  onClick={handleClearAll}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--accent-red)", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Trash2 size={14} /> Clear Logs
                </button>
              </div>
            </div>
          </div>

          {/* List display */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredList.length > 0 ? (
              filteredList.map((item) => {
                const isCritical = item.priority === "high";
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleRead(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "16px",
                      cursor: "pointer",
                      background: item.read ? "var(--bg-card)" : "rgba(0, 82, 255, 0.03)",
                      border: isCritical && !item.read 
                        ? "1px solid var(--accent-red)" 
                        : item.read 
                        ? "1px solid var(--border)" 
                        : "1px solid rgba(0, 82, 255, 0.15)",
                      boxShadow: item.read ? "none" : "0 1px 3px rgba(0,0,0,0.02)",
                      transition: "all 0.15s ease",
                      position: "relative"
                    }}
                  >
                    {/* Left icon category badge */}
                    <div style={{
                      width: "36px",
                      height: "36px",
                      background: isCritical 
                        ? "rgba(244,63,94,0.1)" 
                        : item.type === "attendance" 
                        ? "rgba(34,211,165,0.1)" 
                        : item.type === "task" 
                        ? "rgba(139,92,246,0.1)" 
                        : "rgba(0,82,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      {isCritical ? (
                        <AlertTriangle size={16} color="var(--accent-red)" />
                      ) : item.type === "attendance" ? (
                        <Clock size={16} color="var(--accent-green)" />
                      ) : item.type === "task" ? (
                        <ClipboardList size={16} color="var(--accent-purple)" />
                      ) : (
                        <Info size={16} color="var(--accent-blue)" />
                      )}
                    </div>

                    {/* Message content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {item.employeeName}
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-jetbrains), monospace" }}>
                          {item.date}, {item.time}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: "13px", 
                        color: item.read ? "var(--text-secondary)" : "var(--text-primary)",
                        fontWeight: item.read ? 400 : 600,
                        lineHeight: 1.4
                      }}>
                        {item.message}
                      </div>

                      {/* Badges row */}
                      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                        <span className={`badge ${
                          item.type === "alert" 
                            ? "badge-red" 
                            : item.type === "attendance" 
                            ? "badge-green" 
                            : item.type === "task" 
                            ? "badge-purple" 
                            : "badge-blue"
                        }`} style={{ fontSize: "9px", padding: "1px 6px" }}>
                          {item.type.toUpperCase()}
                        </span>

                        {isCritical && (
                          <span className="badge badge-red" style={{ fontSize: "9px", padding: "1px 6px", fontWeight: 800 }}>
                            CRITICAL ALERT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Read indicator */}
                    {!item.read && (
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--accent-blue)",
                        alignSelf: "center",
                        marginLeft: "6px"
                      }} />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="card" style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", color: "var(--text-muted)" }}>
                <Bell size={24} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: "13px" }}>No operational logs matching your current filters.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
