"use client";

import React from 'react';
import { HeatmapDataPoint } from '@/lib/types/dashboard';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SparklineTableProps {
  data: HeatmapDataPoint[];
}

export function SparklineTable({ data }: SparklineTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
            <th className="px-6 py-4 font-semibold text-slate-700 w-[200px]">12-Month Trend</th>
            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Last Month</th>
            <th className="px-6 py-4 font-semibold text-slate-700 text-right">YTD Total</th>
            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row) => {
            const lastPoint = row.data[row.data.length - 1];
            const total = row.data.reduce((sum, d) => sum + d.value, 0);
            const variance = lastPoint.y; // Variance of last month

            return (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{row.category}</td>
                <td className="px-6 py-4">
                  <div className="h-10 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={row.data}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={variance > 0 ? "#f43f5e" : "#10b981"} // Red if last month over budget
                          strokeWidth={2}
                          dot={false}
                        />
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {lastPoint.value.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-900">
                  {total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    variance > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {variance > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(variance).toFixed(1)}%
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
