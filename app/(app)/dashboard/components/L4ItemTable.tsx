"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function L4ItemTable({ year, catId }: { year: number; catId: string }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/dashboard/l4-items?year=${year}&cat_id=${catId}`)
      .then((res) => res.json())
      .then(setItems);
  }, [year, catId]);

  if (!items.length) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">รายการแผนและซื้อจริง (ย้อนหลัง 12 เดือน)</h2>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ชื่อรายการ</th>
            <th className="border p-2 text-right">แผน (ปี {year})</th>
            <th className="border p-2 text-right">ซื้อจริง (12 เดือน)</th>
            <th className="border p-2 text-center">แนวโน้ม</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2 text-right">{item.plan_current_fy.toLocaleString()}</td>
              <td className="border p-2 text-right text-blue-600">{item.actual_last_12_sum.toLocaleString()}</td>
              <td className="border p-2">
                <div className="w-48 h-24">
                  <Line
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: false } },
                      elements: { point: { radius: 0 } },
                    }}
                    data={{
                      labels: item.monthlyLast12.map((m: any) => m.month),
                      datasets: [
                        {
                          data: item.monthlyLast12.map((m: any) => m.actual),
                          borderColor: "#38bdf8",
                          backgroundColor: "transparent",
                        },
                      ],
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
