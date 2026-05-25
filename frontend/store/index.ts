// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import employeeReducer from "./slices/employeeSlice";
import taskReducer from "./slices/taskSlice";
import attendanceReducer from "./slices/attendanceSlice";
<<<<<<< HEAD
import notificationReducer from "./slices/notificationSlice";
import expenseReducer from "./slices/expenseSlice";
=======
>>>>>>> shagufta-rewrite

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    tasks: taskReducer,
    attendance: attendanceReducer,
<<<<<<< HEAD
    notifications: notificationReducer,
    expenses: expenseReducer,
=======
>>>>>>> shagufta-rewrite
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
