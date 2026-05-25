// lib/mock-data.ts
// All fake data used to make the dashboard look real without a backend

export const mockEmployees = [
  { id: "1", name: "Rahul Sharma", email: "rahul@fieldforce.com", phone: "9876543210", role: "Sales Executive", territory: "Mumbai North", status: "active", avatar: "RS", lat: 19.076, lng: 72.877 },
  { id: "2", name: "Priya Patel", email: "priya@fieldforce.com", phone: "9876543211", role: "Delivery Staff", territory: "Mumbai South", status: "active", avatar: "PP", lat: 18.961, lng: 72.835 },
  { id: "3", name: "Arjun Singh", email: "arjun@fieldforce.com", phone: "9876543212", role: "Service Engineer", territory: "Thane", status: "inactive", avatar: "AS", lat: 19.218, lng: 72.978 },
  { id: "4", name: "Kavya Nair", email: "kavya@fieldforce.com", phone: "9876543213", role: "Marketing Executive", territory: "Pune", status: "active", avatar: "KN", lat: 18.520, lng: 73.856 },
  { id: "5", name: "Ravi Kumar", email: "ravi@fieldforce.com", phone: "9876543214", role: "Surveyor", territory: "Navi Mumbai", status: "active", avatar: "RK", lat: 19.033, lng: 73.029 },
  { id: "6", name: "Meena Joshi", email: "meena@fieldforce.com", phone: "9876543215", role: "Sales Executive", territory: "Nashik", status: "active", avatar: "MJ", lat: 19.997, lng: 73.789 },
  { id: "7", name: "Suresh Yadav", email: "suresh@fieldforce.com", phone: "9876543216", role: "Delivery Staff", territory: "Mumbai North", status: "inactive", avatar: "SY", lat: 19.140, lng: 72.850 },
  { id: "8", name: "Ananya Roy", email: "ananya@fieldforce.com", phone: "9876543217", role: "Healthcare Worker", territory: "Mumbai South", status: "active", avatar: "AR", lat: 18.980, lng: 72.830 },
];

export const mockAttendance = [
  { id: "1", employeeId: "1", name: "Rahul Sharma", date: "2026-05-18", checkIn: "09:02 AM", checkOut: "06:15 PM", hours: "9h 13m", status: "present", location: "Mumbai North" },
  { id: "2", employeeId: "2", name: "Priya Patel", date: "2026-05-18", checkIn: "09:45 AM", checkOut: "05:30 PM", hours: "7h 45m", status: "late", location: "Mumbai South" },
  { id: "3", employeeId: "3", name: "Arjun Singh", date: "2026-05-18", checkIn: "--", checkOut: "--", hours: "--", status: "absent", location: "Thane" },
  { id: "4", employeeId: "4", name: "Kavya Nair", date: "2026-05-18", checkIn: "08:55 AM", checkOut: "06:00 PM", hours: "9h 05m", status: "present", location: "Pune" },
  { id: "5", employeeId: "5", name: "Ravi Kumar", date: "2026-05-18", checkIn: "09:10 AM", checkOut: "--", hours: "Active", status: "present", location: "Navi Mumbai" },
  { id: "6", employeeId: "6", name: "Meena Joshi", date: "2026-05-18", checkIn: "09:00 AM", checkOut: "05:45 PM", hours: "8h 45m", status: "present", location: "Nashik" },
  { id: "7", employeeId: "7", name: "Suresh Yadav", date: "2026-05-18", checkIn: "--", checkOut: "--", hours: "--", status: "absent", location: "Mumbai North" },
  { id: "8", employeeId: "8", name: "Ananya Roy", date: "2026-05-18", checkIn: "10:15 AM", checkOut: "04:30 PM", hours: "6h 15m", status: "late", location: "Mumbai South" },
];

export const mockTasks = [
  { id: "1", title: "Client Visit — TechCorp Ltd", description: "Meet the client and present the new product catalog.", assignedTo: "Rahul Sharma", employeeId: "1", priority: "high", status: "in-progress", deadline: "2026-05-18", territory: "Mumbai North" },
  { id: "2", title: "Deliver Package — Order #4521", description: "Deliver electronics package to customer address.", assignedTo: "Priya Patel", employeeId: "2", priority: "high", status: "completed", deadline: "2026-05-18", territory: "Mumbai South" },
  { id: "3", title: "AC Service — Residence Visit", description: "Annual servicing of split AC units at customer home.", assignedTo: "Arjun Singh", employeeId: "3", priority: "medium", status: "pending", deadline: "2026-05-19", territory: "Thane" },
  { id: "4", title: "Market Survey — Pune West Zone", description: "Conduct market survey for new product launch.", assignedTo: "Kavya Nair", employeeId: "4", priority: "medium", status: "in-progress", deadline: "2026-05-20", territory: "Pune" },
  { id: "5", title: "Land Survey — Plot #778", description: "Survey and map the designated plot area.", assignedTo: "Ravi Kumar", employeeId: "5", priority: "low", status: "pending", deadline: "2026-05-21", territory: "Navi Mumbai" },
  { id: "6", title: "Sales Demo — Fashion Expo", description: "Demonstrate product range at fashion expo.", assignedTo: "Meena Joshi", employeeId: "6", priority: "high", status: "completed", deadline: "2026-05-17", territory: "Nashik" },
  { id: "7", title: "Patient Home Visit — Ward 12", description: "Follow-up visit for post-discharge patients.", assignedTo: "Ananya Roy", employeeId: "8", priority: "high", status: "in-progress", deadline: "2026-05-18", territory: "Mumbai South" },
];

export const mockChartData = [
  { day: "Mon", present: 6, absent: 2, tasks: 5 },
  { day: "Tue", present: 7, absent: 1, tasks: 7 },
  { day: "Wed", present: 5, absent: 3, tasks: 4 },
  { day: "Thu", present: 8, absent: 0, tasks: 9 },
  { day: "Fri", present: 7, absent: 1, tasks: 6 },
  { day: "Sat", present: 4, absent: 4, tasks: 3 },
  { day: "Today", present: 6, absent: 2, tasks: 7 },
];

export const mockRecentActivity = [
  { id: "1", type: "checkin", message: "Rahul Sharma checked in", time: "9:02 AM", icon: "checkin" },
  { id: "2", type: "task", message: "Priya Patel completed 'Deliver Package'", time: "10:30 AM", icon: "task" },
  { id: "3", type: "checkin", message: "Kavya Nair checked in", time: "8:55 AM", icon: "checkin" },
  { id: "4", type: "alert", message: "Arjun Singh marked absent", time: "9:30 AM", icon: "alert" },
  { id: "5", type: "task", message: "Meena Joshi completed 'Sales Demo'", time: "11:00 AM", icon: "task" },
  { id: "6", type: "checkin", message: "Ananya Roy checked in (late)", time: "10:15 AM", icon: "late" },
];

export const mockStats = {
  totalEmployees: 8,
  presentToday: 6,
  absentToday: 2,
  tasksCompleted: 2,
  tasksPending: 3,
  tasksInProgress: 2,
  activeNow: 5,
};
