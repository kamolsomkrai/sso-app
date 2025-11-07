// lib/mock-data.ts

// 1. Interfaces
export interface Expense {
  id: string;
  date: string; // "YYYY-MM-DD"
  department: "IT" | "Human Resources" | "Medical" | "Operations";
  category:
    | "Salaries"
    | "Software"
    | "Hardware"
    | "Medical Supplies"
    | "Utilities";
  amount: number;
}

export interface KpiData {
  totalExpense: number;
  budgetVariance: number;
  topSpendingDept: string;
}

// 2. Mock Data
export const allExpenses: Expense[] = [
  // --- Q1 (Oct, Nov, Dec 2024) ---
  {
    id: "1",
    date: "2024-10-05",
    department: "IT",
    category: "Software",
    amount: 75000,
  },
  {
    id: "2",
    date: "2024-10-10",
    department: "Medical",
    category: "Medical Supplies",
    amount: 320000,
  },
  {
    id: "3",
    date: "2024-10-15",
    department: "Human Resources",
    category: "Salaries",
    amount: 850000,
  },
  {
    id: "4",
    date: "2024-11-05",
    department: "IT",
    category: "Hardware",
    amount: 150000,
  },
  {
    id: "5",
    date: "2024-11-15",
    department: "Human Resources",
    category: "Salaries",
    amount: 850000,
  },
  {
    id: "6",
    date: "2024-11-20",
    department: "Operations",
    category: "Utilities",
    amount: 120000,
  },
  {
    id: "7",
    date: "2024-12-10",
    department: "Medical",
    category: "Medical Supplies",
    amount: 450000,
  },
  {
    id: "8",
    date: "2024-12-15",
    department: "Human Resources",
    category: "Salaries",
    amount: 850000,
  },
  {
    id: "9",
    date: "2024-12-20",
    department: "IT",
    category: "Software",
    amount: 75000,
  },
  // --- Q2 (Jan, Feb, Mar 2025) ---
  {
    id: "10",
    date: "2025-01-10",
    department: "Operations",
    category: "Utilities",
    amount: 130000,
  },
  {
    id: "11",
    date: "2025-01-15",
    department: "Human Resources",
    category: "Salaries",
    amount: 860000,
  },
  {
    id: "12",
    date: "2025-01-20",
    department: "Medical",
    category: "Medical Supplies",
    amount: 300000,
  },
  {
    id: "13",
    date: "2025-02-05",
    department: "IT",
    category: "Hardware",
    amount: 50000,
  },
  {
    id: "14",
    date: "2025-02-15",
    department: "Human Resources",
    category: "Salaries",
    amount: 860000,
  },
  {
    id: "15",
    date: "2025-03-10",
    department: "Medical",
    category: "Medical Supplies",
    amount: 400000,
  },
  {
    id: "16",
    date: "2025-03-15",
    department: "Human Resources",
    category: "Salaries",
    amount: 860000,
  },
];
