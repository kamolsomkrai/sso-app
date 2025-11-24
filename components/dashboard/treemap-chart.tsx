"use client";

import React from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { TreemapNode } from '@/lib/types/dashboard';

interface TreemapChartProps {
  data: TreemapNode[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green, Yellow, Red

const CustomizedContent = (props: any) => {
  const { x, y, width, height, depth, name, utilization } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: utilization > 100 ? COLORS[2] : utilization > 80 ? COLORS[1] : COLORS[0],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {width > 50 && height > 50 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 14}
          textAnchor="middle"
          fill="#fff"
          fontSize={10}
        >
          {utilization ? utilization.toFixed(0) + '%' : '0%'}
        </text>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
        <p className="font-bold text-slate-900 mb-1">{data.name}</p>
        <div className="space-y-1">
          <p className="text-slate-600">
            Plan: <span className="font-medium text-slate-900">{data.size.toLocaleString()}</span>
          </p>
          <p className="text-slate-600">
            Actual: <span className="font-medium text-slate-900">{data.value.toLocaleString()}</span>
          </p>
          <p className={data.utilization > 100 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
            Utilization: {data.utilization.toFixed(1)}%
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function TreemapChart({ data }: TreemapChartProps) {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <Treemap
        data={data as any}
        dataKey="size"
        aspectRatio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
        content={<CustomizedContent />}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
