import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { mockTasks } from "@/lib/mock-data";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  employeeId: string;
  priority: string;
  status: string;
  deadline: string;
  territory: string;
}

interface TaskState {
  list: Task[];
}

const initialState: TaskState = {
  list: mockTasks,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      state.list.push(action.payload);
    },
    updateTaskStatus(state, action: PayloadAction<{ id: string; status: string }>) {
      const task = state.list.find((t) => t.id === action.payload.id);
      if (task) task.status = action.payload.status;
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.list = state.list.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addTask, updateTaskStatus, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;
