import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { usersApi, ApiUser } from "@/lib/api-client";

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
  employeeId?: string;
  password?: string;
  territoryId?: string | null;
}

interface EmployeeState {
  list: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  list: [],
  loading: false,
  error: null,
};

function mapApiUserToEmployee(u: ApiUser): Employee {
  const initials = u.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || "",
    role: u.role,
    territory: u.territory?.name || "Unassigned",
    status: u.status?.toLowerCase() || "active",
    avatar: initials,
    lat: 0,
    lng: 0,
    employeeId: u.employeeId,
    territoryId: u.territoryId,
  };
}

export const fetchEmployees = createAsyncThunk(
  "employees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await usersApi.list({ limit: 100 });
      return res.data.map(mapApiUserToEmployee);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch employees";
      return rejectWithValue(message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/create",
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const res = await usersApi.create(data);
      return mapApiUserToEmployee(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create employee";
      return rejectWithValue(message);
    }
  }
);

export const removeEmployee = createAsyncThunk(
  "employees/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await usersApi.delete(id);
      return id;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete employee";
      return rejectWithValue(message);
    }
  }
);

export const updateEmployeeThunk = createAsyncThunk(
  "employees/update",
  async ({ id, data }: { id: string; data: Record<string, unknown> }, { rejectWithValue }) => {
    try {
      const res = await usersApi.update(id, data);
      return mapApiUserToEmployee(res.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update employee";
      return rejectWithValue(message);
    }
  }
);

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
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        const idx = state.list.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload);
      });
  },
});

export const { addEmployee, updateEmployee, deleteEmployee, clearError } = employeeSlice.actions;
export default employeeSlice.reducer;
