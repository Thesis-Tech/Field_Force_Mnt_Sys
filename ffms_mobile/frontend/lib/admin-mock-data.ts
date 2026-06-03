// lib/admin-mock-data.ts
// Mock data for the Admin Dashboard (separate from Manager mock data)

export interface Manager {
  id: string;
  name: string;
  email: string;
  department: string;
  assignedProjects: number;
  teamSize: number;
  status: "active" | "inactive";
  avatar: string;
  phone: string;
  joinedDate: string;
  performanceScore: number;
}

export interface Project {
  id: string;
  name: string;
  assignedManager: string;
  managerId: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "active" | "completed" | "on-hold" | "planning";
  department: string;
  budget: string;
}

export const mockManagers: Manager[] = [
  { id: "m1", name: "Aditya Sharma", email: "aditya@fieldforce.com", department: "Sales", assignedProjects: 3, teamSize: 8, status: "active", avatar: "AS", phone: "9876501001", joinedDate: "2024-01-15", performanceScore: 92 },
  { id: "m2", name: "Sneha Patil", email: "sneha@fieldforce.com", department: "Operations", assignedProjects: 2, teamSize: 6, status: "active", avatar: "SP", phone: "9876501002", joinedDate: "2024-03-20", performanceScore: 87 },
  { id: "m3", name: "Rajesh Verma", email: "rajesh@fieldforce.com", department: "Delivery", assignedProjects: 4, teamSize: 12, status: "active", avatar: "RV", phone: "9876501003", joinedDate: "2023-11-10", performanceScore: 78 },
  { id: "m4", name: "Pooja Mehta", email: "pooja@fieldforce.com", department: "Marketing", assignedProjects: 2, teamSize: 5, status: "inactive", avatar: "PM", phone: "9876501004", joinedDate: "2024-06-01", performanceScore: 65 },
  { id: "m5", name: "Kiran Desai", email: "kiran@fieldforce.com", department: "Field Services", assignedProjects: 3, teamSize: 9, status: "active", avatar: "KD", phone: "9876501005", joinedDate: "2024-02-14", performanceScore: 95 },
  { id: "m6", name: "Anand Joshi", email: "anand@fieldforce.com", department: "Support", assignedProjects: 1, teamSize: 4, status: "active", avatar: "AJ", phone: "9876501006", joinedDate: "2025-01-08", performanceScore: 82 },
];

export const mockProjects: Project[] = [
  { id: "p1", name: "Mumbai North Expansion", assignedManager: "Aditya Sharma", managerId: "m1", startDate: "2026-04-01", endDate: "2026-07-31", progress: 68, status: "active", department: "Sales", budget: "₹4.2L" },
  { id: "p2", name: "Warehouse Ops Overhaul", assignedManager: "Rajesh Verma", managerId: "m3", startDate: "2026-03-15", endDate: "2026-06-30", progress: 45, status: "active", department: "Delivery", budget: "₹6.8L" },
  { id: "p3", name: "Digital Campaign Q2", assignedManager: "Pooja Mehta", managerId: "m4", startDate: "2026-04-10", endDate: "2026-06-10", progress: 90, status: "completed", department: "Marketing", budget: "₹2.1L" },
  { id: "p4", name: "Field Service Upgrade", assignedManager: "Kiran Desai", managerId: "m5", startDate: "2026-05-01", endDate: "2026-08-31", progress: 25, status: "active", department: "Field Services", budget: "₹9.5L" },
  { id: "p5", name: "Customer Support Portal", assignedManager: "Anand Joshi", managerId: "m6", startDate: "2026-05-15", endDate: "2026-09-30", progress: 10, status: "planning", department: "Support", budget: "₹3.3L" },
  { id: "p6", name: "Ops Streamlining Initiative", assignedManager: "Sneha Patil", managerId: "m2", startDate: "2026-02-01", endDate: "2026-05-31", progress: 55, status: "on-hold", department: "Operations", budget: "₹5.0L" },
];

// ── KPI Summary ──
export const adminKPIs = {
  totalManagers: 6,
  totalEmployees: 44,
  activeProjects: 4,
  todayAttendancePct: 84,
  pendingApprovals: 7,
  activeFieldEmployees: 31,
};

// ── Charts ──
export const employeeDistributionData = [
  { name: "Sales", value: 10, color: "#3b82f6" },
  { name: "Delivery", value: 14, color: "#22c55e" },
  { name: "Field Services", value: 9, color: "#f97316" },
  { name: "Marketing", value: 5, color: "#8b5cf6" },
  { name: "Operations", value: 6, color: "#06b6d4" },
];

export const attendanceTrendData = [
  { week: "W1", attendance: 78 },
  { week: "W2", attendance: 82 },
  { week: "W3", attendance: 75 },
  { week: "W4", attendance: 88 },
  { week: "W5", attendance: 84 },
  { week: "W6", attendance: 91 },
  { week: "W7", attendance: 87 },
];

export const projectStatusData = [
  { name: "Active", value: 4, color: "#22c55e" },
  { name: "Planning", value: 1, color: "#3b82f6" },
  { name: "On Hold", value: 1, color: "#f97316" },
  { name: "Completed", value: 1, color: "#8b5cf6" },
];

export const managerPerformanceData = [
  { name: "Kiran D.", score: 95 },
  { name: "Aditya S.", score: 92 },
  { name: "Sneha P.", score: 87 },
  { name: "Anand J.", score: 82 },
  { name: "Rajesh V.", score: 78 },
  { name: "Pooja M.", score: 65 },
];

// ── Analytics ──
export const employeeGrowthData = [
  { month: "Jan", employees: 32 },
  { month: "Feb", employees: 35 },
  { month: "Mar", employees: 36 },
  { month: "Apr", employees: 40 },
  { month: "May", employees: 44 },
  { month: "Jun", employees: 44 },
];

export const orgAttendanceTrend = [
  { month: "Jan", present: 76, absent: 12, late: 8 },
  { month: "Feb", present: 80, absent: 10, late: 10 },
  { month: "Mar", present: 74, absent: 16, late: 10 },
  { month: "Apr", present: 83, absent: 9, late: 8 },
  { month: "May", present: 88, absent: 7, late: 5 },
  { month: "Jun", present: 84, absent: 10, late: 6 },
];

export const projectProgressData = [
  { name: "Mumbai North", progress: 68 },
  { name: "Warehouse Ops", progress: 45 },
  { name: "Digital Campaign", progress: 90 },
  { name: "Field Upgrade", progress: 25 },
  { name: "Support Portal", progress: 10 },
  { name: "Ops Initiative", progress: 55 },
];

export const productivityByDeptData = [
  { dept: "Sales", score: 88 },
  { dept: "Delivery", score: 74 },
  { dept: "Field Svcs", score: 93 },
  { dept: "Marketing", score: 71 },
  { dept: "Ops", score: 80 },
];

// ── Reports ──
export const reportFilters = {
  departments: ["All Departments", "Sales", "Delivery", "Field Services", "Marketing", "Operations", "Support"],
  managers: ["All Managers", "Aditya Sharma", "Sneha Patil", "Rajesh Verma", "Pooja Mehta", "Kiran Desai", "Anand Joshi"],
};

export const attendanceReportRows = [
  { date: "2026-05-31", department: "Sales", present: 9, absent: 1, late: 0, rate: "90%" },
  { date: "2026-05-31", department: "Delivery", present: 11, absent: 2, late: 1, rate: "79%" },
  { date: "2026-05-31", department: "Field Services", present: 8, absent: 1, late: 0, rate: "89%" },
  { date: "2026-05-31", department: "Marketing", present: 4, absent: 1, late: 0, rate: "80%" },
  { date: "2026-05-31", department: "Operations", present: 5, absent: 1, late: 0, rate: "83%" },
];

export const performanceReportRows = [
  { manager: "Kiran Desai", dept: "Field Services", tasksCompleted: 142, attendanceRate: "93%", score: 95, trend: "up" },
  { manager: "Aditya Sharma", dept: "Sales", tasksCompleted: 135, attendanceRate: "91%", score: 92, trend: "up" },
  { manager: "Sneha Patil", dept: "Operations", tasksCompleted: 118, attendanceRate: "88%", score: 87, trend: "stable" },
  { manager: "Anand Joshi", dept: "Support", tasksCompleted: 96, attendanceRate: "85%", score: 82, trend: "up" },
  { manager: "Rajesh Verma", dept: "Delivery", tasksCompleted: 109, attendanceRate: "80%", score: 78, trend: "down" },
  { manager: "Pooja Mehta", dept: "Marketing", tasksCompleted: 72, attendanceRate: "72%", score: 65, trend: "down" },
];
