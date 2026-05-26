import { createSlice } from "@reduxjs/toolkit";
import { mockAttendance } from "@/lib/mock-data";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: string;
  status: string;
  location: string;
}

interface AttendanceState {
  list: AttendanceRecord[];
}

const initialState: AttendanceState = {
  list: mockAttendance,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
});

export default attendanceSlice.reducer;
