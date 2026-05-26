import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationItem {
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

interface NotificationState {
  list: NotificationItem[];
}

const initialState: NotificationState = {
  list: [
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
      message: "Ananya Roy logged check-in: 1h 15m Late arrival alert dispatched to admin",
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
  ]
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Omit<NotificationItem, "id" | "time" | "date" | "read"> & { id?: string; time?: string; date?: string }>) {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      state.list.unshift({
        id: action.payload.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        time: action.payload.time || timeString,
        date: action.payload.date || "Today",
        read: false,
        ...action.payload
      });
    },
    markAllAsRead(state) {
      state.list.forEach(n => { n.read = true; });
    },
    clearAllNotifications(state) {
      state.list = [];
    },
    toggleNotificationRead(state, action: PayloadAction<string>) {
      const notif = state.list.find(n => n.id === action.payload);
      if (notif) notif.read = !notif.read;
    }
  }
});

export const { addNotification, markAllAsRead, clearAllNotifications, toggleNotificationRead } = notificationSlice.actions;
export default notificationSlice.reducer;
