// lib/mock-data.ts
// All fake data used to make the dashboard look real without a backend

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  territory: string;
  status: string;
  avatar: string;
  lat: number;
  lng: number;
}

export const mockEmployees: Employee[] = [
  { id: "1", name: "John Doe", email: "john@fieldforce.com", phone: "9876543201", role: "Sales Executive", territory: "Site A", status: "active", avatar: "JD", lat: 19.076, lng: 72.877 },
  { id: "2", name: "Sarah Miller", email: "sarah@fieldforce.com", phone: "9876543202", role: "Marketing Lead", territory: "Site B", status: "active", avatar: "SM", lat: 18.961, lng: 72.835 },
  { id: "3", name: "Amit Kumar", email: "amit@fieldforce.com", phone: "9876543203", role: "Delivery Staff", territory: "Zone West", status: "active", avatar: "AK", lat: 19.218, lng: 72.978 },
  { id: "4", name: "Rick James", email: "rick@fieldforce.com", phone: "9876543204", role: "Service Engineer", territory: "Zone East", status: "inactive", avatar: "RJ", lat: 18.520, lng: 73.856 },
  { id: "5", name: "Priya Lal", email: "priya.l@fieldforce.com", phone: "9876543205", role: "Surveyor", territory: "Zone North", status: "active", avatar: "PL", lat: 19.033, lng: 73.029 },
  { id: "6", name: "Ravi Kumar", email: "ravi@fieldforce.com", phone: "9876543206", role: "Global Ops", territory: "HQ", status: "active", avatar: "RK", lat: 19.997, lng: 73.789 },
  { id: "7", name: "Ananya Roy", email: "ananya@fieldforce.com", phone: "9876543207", role: "Healthcare Worker", territory: "HQ", status: "active", avatar: "AR", lat: 19.140, lng: 72.850 },
  { id: "8", name: "Suresh Yadav", email: "suresh@fieldforce.com", phone: "9876543208", role: "Delivery Staff", territory: "Mumbai North", status: "inactive", avatar: "SY", lat: 18.980, lng: 72.830 },
  { id: "9", name: "Kavya Nair", email: "kavya@fieldforce.com", phone: "9876543209", role: "Marketing Executive", territory: "Pune", status: "active", avatar: "KN", lat: 18.530, lng: 73.840 },
  { id: "10", name: "Arjun Singh", email: "arjun@fieldforce.com", phone: "9876543210", role: "Service Engineer", territory: "Thane", status: "active", avatar: "AS", lat: 19.220, lng: 72.980 },
  { id: "11", name: "Meena Joshi", email: "meena@fieldforce.com", phone: "9876543211", role: "Sales Executive", territory: "Nashik", status: "active", avatar: "MJ", lat: 20.000, lng: 73.790 },
  { id: "12", name: "Rahul Sharma", email: "rahul@fieldforce.com", phone: "9876543212", role: "Sales Executive", territory: "Mumbai North", status: "active", avatar: "RS", lat: 19.080, lng: 72.880 },
];

export const mockAttendance = [
  { id: "1", employeeId: "1", name: "John Doe", date: "2026-05-18", checkIn: "09:02 AM", checkOut: "--", hours: "Active", status: "present", location: "Site A" },
  { id: "2", employeeId: "2", name: "Sarah Miller", date: "2026-05-18", checkIn: "09:45 AM", checkOut: "--", hours: "Active", status: "late", location: "Site B" },
  { id: "3", employeeId: "3", name: "Amit Kumar", date: "2026-05-18", checkIn: "09:12 AM", checkOut: "--", hours: "Active", status: "present", location: "Zone West" },
  { id: "4", employeeId: "4", name: "Rick James", date: "2026-05-18", checkIn: "--", checkOut: "--", hours: "--", status: "absent", location: "Zone East" },
  { id: "5", employeeId: "5", name: "Priya Lal", date: "2026-05-18", checkIn: "08:50 AM", checkOut: "--", hours: "Active", status: "present", location: "Zone North" },
  { id: "6", employeeId: "6", name: "Ravi Kumar", date: "2026-05-18", checkIn: "09:00 AM", checkOut: "--", hours: "Active", status: "present", location: "HQ" },
  { id: "7", employeeId: "7", name: "Ananya Roy", date: "2026-05-18", checkIn: "10:15 AM", checkOut: "--", hours: "Active", status: "late", location: "HQ" },
  { id: "8", employeeId: "8", name: "Suresh Yadav", date: "2026-05-18", checkIn: "--", checkOut: "--", hours: "--", status: "absent", location: "Mumbai North" },
  { id: "9", employeeId: "9", name: "Kavya Nair", date: "2026-05-18", checkIn: "08:55 AM", checkOut: "--", hours: "Active", status: "present", location: "Pune" },
  { id: "10", employeeId: "10", name: "Arjun Singh", date: "2026-05-18", checkIn: "08:58 AM", checkOut: "--", hours: "Active", status: "present", location: "Thane" },
  { id: "11", employeeId: "11", name: "Meena Joshi", date: "2026-05-18", checkIn: "09:00 AM", checkOut: "--", hours: "Active", status: "present", location: "Nashik" },
  { id: "12", employeeId: "12", name: "Rahul Sharma", date: "2026-05-18", checkIn: "08:45 AM", checkOut: "--", hours: "Active", status: "present", location: "Mumbai North" },
];

export const mockTasks = [
  { id: "1", title: "Client Visit — TechCorp Ltd", description: "Meet the client and present the new product catalog.", assignedTo: "John Doe", employeeId: "1", priority: "high", status: "completed", deadline: "2026-05-28", territory: "Site A" },
  { id: "2", title: "Deliver Package — Order #4521", description: "Deliver electronics package to customer address.", assignedTo: "Amit Kumar", employeeId: "3", priority: "high", status: "completed", deadline: "2026-05-28", territory: "Zone West" },
  { id: "3", title: "AC Service — Residence Visit", description: "Annual servicing of split AC units at customer home.", assignedTo: "Sarah Miller", employeeId: "2", priority: "medium", status: "in-progress", deadline: "2026-05-28", territory: "Site B" },
  { id: "4", title: "Market Survey — Pune West Zone", description: "Conduct market survey for new product launch.", assignedTo: "Kavya Nair", employeeId: "9", priority: "medium", status: "in-progress", deadline: "2026-05-28", territory: "Pune" },
  { id: "5", title: "Land Survey — Plot #778", description: "Survey and map the designated plot area.", assignedTo: "Priya Lal", employeeId: "5", priority: "low", status: "pending", deadline: "2026-05-28", territory: "Zone North" },
  { id: "6", title: "Sales Demo — Fashion Expo", description: "Demonstrate product range at fashion expo.", assignedTo: "Meena Joshi", employeeId: "11", priority: "high", status: "completed", deadline: "2026-05-28", territory: "Nashik" },
  { id: "7", title: "Patient Home Visit — Ward 12", description: "Follow-up visit for post-discharge patients.", assignedTo: "Rahul Sharma", employeeId: "12", priority: "high", status: "completed", deadline: "2026-05-28", territory: "Mumbai North" },
];

export const mockChartData = [
  { day: "Mon", tasks: 4 },
  { day: "Tue", tasks: 7 },
  { day: "Wed", tasks: 5 },
  { day: "Thu", tasks: 9 },
  { day: "Fri", tasks: 6 },
  { day: "Sat", tasks: 3 },
  { day: "Sun", tasks: 8 },
];

export const taskOverviewData = [
  { day: "Mon", completed: 15, inProgress: 10, pending: 5 },
  { day: "Tue", completed: 25, inProgress: 18, pending: 8 },
  { day: "Wed", completed: 40, inProgress: 22, pending: 12 },
  { day: "Thu", completed: 35, inProgress: 30, pending: 10 },
  { day: "Fri", completed: 55, inProgress: 38, pending: 15 },
  { day: "Sat", completed: 70, inProgress: 48, pending: 18 },
  { day: "Sun", completed: 85, inProgress: 55, pending: 22 },
];

export const productivityData = [
  { day: "Mon", tasksCompleted: 30, completionRate: 45 },
  { day: "Tue", tasksCompleted: 45, completionRate: 55 },
  { day: "Wed", tasksCompleted: 55, completionRate: 60 },
  { day: "Thu", tasksCompleted: 40, completionRate: 50 },
  { day: "Fri", tasksCompleted: 80, completionRate: 75 },
  { day: "Sat", tasksCompleted: 60, completionRate: 65 },
  { day: "Sun", tasksCompleted: 50, completionRate: 58 },
];

export const mockRecentActivity = [
  { id: "1", type: "attendance", message: "John Doe checked in at Site A.", time: "2m ago", employeeName: "John Doe", avatar: "JD", status: "present" },
  { id: "2", type: "task", message: "Sarah Miller marked Task #42 as pending.", time: "15m ago", employeeName: "Sarah Miller", avatar: "SM", status: "late" },
  { id: "3", type: "task", message: "Amit Kumar completed Delivery #88.", time: "22m ago", employeeName: "Amit Kumar", avatar: "AK", status: "present" },
  { id: "4", type: "alert", message: "Rick James missed check-in window.", time: "1h ago", employeeName: "Rick James", avatar: "RJ", status: "absent" },
  { id: "5", type: "alert", message: "Priya Lal entered geofence Zone North.", time: "1.5h ago", employeeName: "Priya Lal", avatar: "PL", status: "present" },
];

export const mockStats = {
  totalEmployees: 12,
  presentToday: 8,
  absentToday: 2,
  lateToday: 2,
  tasksCompleted: 4,
  tasksPending: 1,
  tasksInProgress: 2,
  activeNow: 10,
};
