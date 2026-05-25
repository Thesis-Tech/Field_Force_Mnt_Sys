import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockEmployees } from "@/lib/mock-data";

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
<<<<<<< HEAD
  password?: string;
=======
>>>>>>> shagufta-rewrite
}

interface EmployeeState {
  list: Employee[];
}

const initialState: EmployeeState = {
  list: mockEmployees,
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    addEmployee(state, action: PayloadAction<Employee>) {
      state.list.push(action.payload);
    },
    updateEmployee(state, action: PayloadAction<Employee>) {
      const idx = state.list.findIndex((e) => e.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteEmployee(state, action: PayloadAction<string>) {
      state.list = state.list.filter((e) => e.id !== action.payload);
    },
  },
});

export const { addEmployee, updateEmployee, deleteEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
