// components/charts/department-list-chart.tsx

'use client';

import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChartProps {
  data: { id: string; name: string; value: number }[]; //
  selectedDept: string | null; // (รับ name)
  onDeptSelect: (name: string | null) => void;
}

export const DepartmentListChart = ({ data, selectedDept, onDeptSelect }: ChartProps) => {
  // คำนวณยอดรวมเพื่อหา %
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);

  const handleClick = (name: string) => {
    onDeptSelect(name === selectedDept ? null : name);
  };

  if (data.length === 0) {
    return <p className="text-gray-500 text-center">ไม่พบข้อมูล</p>;
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {data.map((item, index) => {
        const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
        const isSelected = item.name === selectedDept;

        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.name)}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all",
              isSelected
                ? "bg-primary/10 border-primary shadow-sm" // สไตล์เมื่อถูกเลือก
                : "bg-transparent border-gray-200 hover:bg-gray-50",
              !selectedDept && "hover:bg-gray-50", // hover effect
              selectedDept && !isSelected && "opacity-50 hover:opacity-100" // สไตล์เมื่อมีอันอื่นถูกเลือก
            )}
          >
            <div className="flex justify-between items-center text-sm font-medium mb-1.5">
              <span className="text-gray-800">{item.name}</span>
              <span className={cn("font-semibold", isSelected ? "text-primary" : "text-gray-800")}>
                {formatCurrency(item.value)}
              </span>
            </div>
            {/* กราฟแท่งแนวนอน (Inline Bar) */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={cn("h-2 rounded-full transition-all", isSelected ? "bg-primary" : "bg-gray-300")}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};