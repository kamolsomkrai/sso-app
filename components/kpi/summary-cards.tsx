"use client";

import React from 'react';
import { StrategySummary } from '@/lib/types/kpi';
import { BarChart3, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface SummaryCardsProps {
  strategySummary: StrategySummary[];
}

export function SummaryCards({ strategySummary }: SummaryCardsProps) {
  const totalKpis = strategySummary.reduce((sum, s) => sum + s.totalKpis, 0);
  const passedKpis = strategySummary.reduce((sum, s) => sum + s.passedKpis, 0);
  const failedKpis = strategySummary.reduce((sum, s) => sum + s.failedKpis, 0);
  const pendingKpis = strategySummary.reduce((sum, s) => sum + s.pendingKpis, 0);

  const cards = [
    {
      title: 'KPI ที่ใช้งาน',
      value: totalKpis,
      icon: BarChart3,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'KPI ที่ผ่าน',
      value: passedKpis,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'KPI ที่ยังไม่ผ่าน',
      value: failedKpis,
      icon: XCircle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'รอข้อมูล',
      value: pendingKpis,
      icon: Clock,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center gap-4"
        >
          <div className={`${card.bgColor} ${card.iconColor} p-3 rounded-full`}>
            <card.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">{card.title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
