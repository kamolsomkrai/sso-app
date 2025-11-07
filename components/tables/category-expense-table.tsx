// components/tables/category-expense-table.tsx

import { formatCurrency } from "@/lib/utils";

interface TableProps {
  data: { name: string; value: number; total: number }[];
}

export const CategoryExpenseTable = ({ data }: TableProps) => {
  if (data.length === 0) {
    return <p className="text-gray-500 text-center">No data available for selected filters.</p>;
  }

  const totalForCalc = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const percentage = totalForCalc > 0 ? (item.value / totalForCalc) * 100 : 0;
        return (
          <div
            key={item.name}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};