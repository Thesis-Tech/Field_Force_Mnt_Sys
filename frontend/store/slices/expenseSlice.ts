import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ExpenseRecord {
  id: string;
  userName: string;
  employeeId: string;
  expenseHead: string;
  expenseCategory: string;
  amount: number;
  expenseDate: string;
  submittedOn: string;
  customer: string;
  status: "Pending Approval by Manager" | "Approved" | "Rejected";
  remark: string;
}

interface ExpenseState {
  list: ExpenseRecord[];
}

const initialState: ExpenseState = {
  list: [
    {
      id: "exp-1",
      userName: "Rahul Sharma",
      employeeId: "1",
      expenseHead: "Client Lunch - Taj",
      expenseCategory: "Food / Meal",
      amount: 4500,
      expenseDate: "2026-05-15",
      submittedOn: "2026-05-16",
      customer: "Reliance Industries",
      status: "Pending Approval by Manager",
      remark: "Annual review lunch with executive team."
    },
    {
      id: "exp-2",
      userName: "Priya Patel",
      employeeId: "2",
      expenseHead: "Pune Site Visit Fuel",
      expenseCategory: "Travel / Conveyance",
      amount: 2200,
      expenseDate: "2026-05-12",
      submittedOn: "2026-05-13",
      customer: "Tata Motors",
      status: "Approved",
      remark: "Fuel bill for customer inspection visit."
    },
    {
      id: "exp-3",
      userName: "Ananya Roy",
      employeeId: "4",
      expenseHead: "Hotel Stay - Pune",
      expenseCategory: "Lodging / Hotel",
      amount: 8500,
      expenseDate: "2026-05-10",
      submittedOn: "2026-05-11",
      customer: "Infosys Campus",
      status: "Approved",
      remark: "2 nights lodging for technical support visit."
    },
    {
      id: "exp-4",
      userName: "Rahul Sharma",
      employeeId: "1",
      expenseHead: "Cab fare to airport",
      expenseCategory: "Travel / Conveyance",
      amount: 950,
      expenseDate: "2026-05-18",
      submittedOn: "2026-05-18",
      customer: "Internal / General",
      status: "Pending Approval by Manager",
      remark: "Travel to Pune branch office."
    }
  ]
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    addExpense(state, action: PayloadAction<ExpenseRecord>) {
      state.list.push(action.payload);
    },
    approveExpense(state, action: PayloadAction<string>) {
      const exp = state.list.find((e) => e.id === action.payload);
      if (exp) exp.status = "Approved";
    },
    rejectExpense(state, action: PayloadAction<{ id: string; remark: string }>) {
      const exp = state.list.find((e) => e.id === action.payload.id);
      if (exp) {
        exp.status = "Rejected";
        exp.remark = action.payload.remark || exp.remark;
      }
    },
    deleteExpense(state, action: PayloadAction<string>) {
      state.list = state.list.filter((e) => e.id !== action.payload);
    }
  }
});

export const { addExpense, approveExpense, rejectExpense, deleteExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
