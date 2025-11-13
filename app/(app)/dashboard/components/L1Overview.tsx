"use client";
import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function L1Overview({ year }: { year: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/dashboard/l1-hub?year=${year}`)
      .then((res) => res.json())
      .then(setData);
  }, [year]);

  if (!data) return <div className="p-4 text-gray-500">Loading...</div>;

  const { monthlyHistory, quarterlyHistory, planByYear } = data.data;

  const monthLabels = ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย."];

  const lineData = {
    labels: monthLabels,
    datasets: monthlyHistory.map((y: any, i: number) => ({
      label: `ปี ${y.year}`,
      data: y.months.map((m: any) => m.actual),
      borderColor: ["#f97316", "#0ea5e9", "#84cc16"][i],
      backgroundColor: "transparent",
    })),
  };

  const barData = {
    labels: ["ไตรมาส 1", "ไตรมาส 2", "ไตรมาส 3", "ไตรมาส 4"],
    datasets: quarterlyHistory.map((y: any, i: number) => ({
      label: `ปี ${y.year}`,
      data: y.quarters.map((q: any) => q.actual),
      backgroundColor: ["#fb923c", "#38bdf8", "#a3e635"][i],
    })),
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">ภาพรวมรายได้/รายจ่าย (ย้อนหลัง 3 ปี)</h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg mb-2 text-gray-700">รายเดือน</h3>
          <Line data={lineData} />
        </div>
        <div>
          <h3 className="text-lg mb-2 text-gray-700">รายไตรมาส</h3>
          <Bar data={barData} />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">สรุปยอดรวมแผนต่อปี</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ปีงบประมาณ</th>
              <th className="border p-2">รายได้</th>
              <th className="border p-2">รายจ่าย</th>
            </tr>
          </thead>
          <tbody>
            {planByYear.map((p: any) => (
              <tr key={p.year}>
                <td className="border p-2 text-center">{p.year}</td>
                <td className="border p-2 text-right text-green-600">{p.revenue.toLocaleString()}</td>
                <td className="border p-2 text-right text-red-600">{p.expense.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
