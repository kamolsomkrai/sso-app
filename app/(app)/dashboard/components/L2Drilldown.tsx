"use client";
import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function L2Drilldown({ year, deptId }: { year: number; deptId: string }) {
  const [l3List, setL3List] = useState<any[]>([]);
  const [selectedL3, setSelectedL3] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/l2-categories?year=${year}&dept_id=${deptId}`)
      .then((r) => r.json())
      .then(setL3List);
  }, [year, deptId]);

  if (!l3List.length) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">หมวดหมู่ L3 (ย้อนหลัง 3 ปี)</h2>

      <div className="space-y-4">
        {l3List.map((l3) => (
          <div key={l3.id} className="border p-4 rounded-lg hover:bg-gray-50">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setSelectedL3(selectedL3 === l3.id ? null : l3.id)}
            >
              <h3 className="font-semibold">{l3.name}</h3>
              <span className="text-sm text-gray-500">แผนปี {year}: {l3.totalPlanCurrent.toLocaleString()} | ใช้จริง: {l3.totalActualCurrent.toLocaleString()}</span>
            </div>

            {selectedL3 === l3.id && (
              <div className="mt-4">
                <Bar
                  data={{
                    labels: ["Q1", "Q2", "Q3", "Q4"],
                    datasets: l3.quarterlyHistory.map((h: any, i: number) => ({
                      label: `ปี ${h.year}`,
                      data: h.quarters.map((q: any) => q.value),
                      backgroundColor: ["#fb923c", "#38bdf8", "#a3e635"][i],
                    })),
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
