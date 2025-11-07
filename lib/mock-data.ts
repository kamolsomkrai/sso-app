// lib/mock-data.ts

// 1. Interfaces (อัปเดตตามข้อมูลจริง)
export interface Expense {
  id: string;
  date: string; // "YYYY-MM-DD" (สังเคราะห์ขึ้นมาสำหรับปีงบ 2569)
  department:
    | "งานบริหาร"
    | "งาน IT"
    | "งานช่าง"
    | "OPD"
    | "IPD"
    | "Lab"
    | "งานพัสดุ";
  category:
    | "ค่าจ้าง พกส."
    | "ค่าจ้าง (รายเดือน)"
    | "ค่าตอบแทน (ในงบ)"
    | "ค่าตอบแทน (นอกงบ)"
    | "วัสดุการแพทย์"
    | "วัสดุคอมพิวเตอร์"
    | "วัสดุไฟฟ้า"
    | "วัสดุก่อสร้าง"
    | "วัสดุสำนักงาน"
    | "วัสดุ Lab";
  amount: number;
}

export interface KpiData {
  totalExpense: number;
  budgetVariance: number;
  topSpendingDept: string;
}

// 2. Mock Data (ดึงข้อมูลจาก CSV ของ รพ.ลอง 2569)
// ผมได้กระจายยอดรวมจากแผนฯ ไปยังเดือนต่างๆ ในปีงบ 2569
export const allExpenses: Expense[] = [
  // --- Q1: ต.ค. - ธ.ค. 2568 ---
  {
    id: "1",
    date: "2024-10-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง พกส.",
    amount: 1616830,
  }, // (19.4M / 12)
  {
    id: "2",
    date: "2024-10-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง (รายเดือน)",
    amount: 102240,
  }, // (1.2M / 12)
  {
    id: "3",
    date: "2024-10-15",
    department: "งานบริหาร",
    category: "ค่าตอบแทน (ในงบ)",
    amount: 719150,
  }, // (8.6M / 12)
  {
    id: "4",
    date: "2024-10-20",
    department: "OPD",
    category: "วัสดุการแพทย์",
    amount: 150000,
  },
  {
    id: "5",
    date: "2024-10-25",
    department: "งาน IT",
    category: "วัสดุคอมพิวเตอร์",
    amount: 30000,
  },
  {
    id: "6",
    date: "2024-11-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง พกส.",
    amount: 1616830,
  },
  {
    id: "7",
    date: "2024-11-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง (รายเดือน)",
    amount: 102240,
  },
  {
    id: "8",
    date: "2024-11-20",
    department: "IPD",
    category: "วัสดุการแพทย์",
    amount: 200000,
  },
  {
    id: "9",
    date: "2024-11-25",
    department: "งานช่าง",
    category: "วัสดุไฟฟ้า",
    amount: 25000,
  },
  {
    id: "10",
    date: "2024-12-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง พกส.",
    amount: 1616830,
  },
  {
    id: "11",
    date: "2024-12-15",
    department: "งานบริหาร",
    category: "ค่าตอบแทน (นอกงบ)",
    amount: 562500,
  }, // (6.7M / 12)
  {
    id: "12",
    date: "2024-12-20",
    department: "Lab",
    category: "วัสดุ Lab",
    amount: 100000,
  },
  {
    id: "13",
    date: "2024-12-25",
    department: "งาน IT",
    category: "วัสดุคอมพิวเตอร์",
    amount: 50000,
  },

  // --- Q2: ม.ค. - มี.ค. 2569 ---
  {
    id: "14",
    date: "2025-01-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง พกส.",
    amount: 1616830,
  },
  {
    id: "15",
    date: "2025-01-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง (รายเดือน)",
    amount: 102240,
  },
  {
    id: "16",
    date: "2025-01-15",
    department: "งานบริหาร",
    category: "ค่าตอบแทน (ในงบ)",
    amount: 719150,
  },
  {
    id: "17",
    date: "2025-01-20",
    department: "OPD",
    category: "วัสดุการแพทย์",
    amount: 100000,
  },
  {
    id: "18",
    date: "2025-01-25",
    department: "งานพัสดุ",
    category: "วัสดุสำนักงาน",
    amount: 40000,
  },
  {
    id: "19",
    date: "2025-02-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง พกส.",
    amount: 1616830,
  },
  {
    id: "20",
    date: "2025-02-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง (รายเดือน)",
    amount: 102240,
  },
  {
    id: "21",
    date: "2025-02-20",
    department: "IPD",
    category: "วัสดุการแพทย์",
    amount: 250000,
  },
  {
    id: "22",
    date: "2025-02-25",
    department: "งานช่าง",
    category: "วัสดุก่อสร้าง",
    amount: 50000,
  },
  {
    id: "23",
    date: "2025-03-15",
    department: "งานบริหาร",
    category: "ค่าจ้าง พกส.",
    amount: 1616830,
  },
  {
    id: "24",
    date: "2025-03-15",
    department: "งานบริหาร",
    category: "ค่าตอบแทน (นอกงบ)",
    amount: 562500,
  },
  {
    id: "25",
    date: "2025-03-20",
    department: "Lab",
    category: "วัสดุ Lab",
    amount: 150000,
  },
  {
    id: "26",
    date: "2025-03-25",
    department: "งาน IT",
    category: "วัสดุคอมพิวเตอร์",
    amount: 20000,
  },

  // (ในระบบจริง ข้อมูลส่วนที่เหลือของปีจะถูกเพิ่มเข้ามาจนครบ)
];
