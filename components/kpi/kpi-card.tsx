"use client";

import React, { useState } from 'react';
import { KpiData } from '@/lib/types/kpi';
import { KpiGauge } from './kpi-gauge';
import { KpiEditDialog } from './kpi-edit-dialog';
import { QuarterlyEditDialog } from './quarterly-edit-dialog';
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

interface KpiCardProps {
  kpi: KpiData;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState<{
    id: string;
    quarter: number;
    target: string;
    result: string;
  } | null>(null);

  const queryClient = useQueryClient();

  // Calculate overall progress from latest quarter
  const latestQuarter = kpi.quarterlyData
    .filter((q) => q.result)
    .sort((a, b) => b.quarter - a.quarter)[0];

  const progress = latestQuarter
    ? calculateProgress(latestQuarter.result, latestQuarter.quarterlyTarget, kpi.calcLogic)
    : 0;

  const isInactive = !kpi.isActive;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/kpi/${kpi.kpiId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-summary'] });
      toast.success('ลบ KPI สำเร็จ');
      setShowDeleteDialog(false);
    },
    onError: () => {
      toast.error('เกิดข้อผิดพลาดในการลบ KPI');
    },
  });

  return (
    <>
      <div
        className={`bg-white rounded-xl border ${
          isInactive
            ? 'border-slate-300 bg-slate-50 opacity-70'
            : 'border-slate-200'
        } shadow-sm hover:shadow-md transition-all relative overflow-hidden`}
      >
        {isInactive && (
          <div className="absolute top-2 right-2 bg-slate-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
            ยกเลิก
          </div>
        )}

        {/* Header */}
        <div
          className={`p-4 bg-slate-50/50 cursor-pointer ${
            !isInactive && 'hover:bg-slate-100/50'
          } transition-colors`}
          onClick={() => !isInactive && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <h4 className="font-semibold text-slate-900 line-clamp-2 flex-1">
                  {kpi.kpiName}
                </h4>
                {!isInactive && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{kpi.targetText}</p>
              {kpi.owner && (
                <p className="text-xs text-slate-400 mt-1">ผู้รับผิดชอบ: {kpi.owner}</p>
              )}
            </div>
            {!isInactive && (
              <button className="ml-2 text-slate-400 hover:text-slate-600">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Gauge */}
        <div className="p-6 flex justify-center">
          <KpiGauge value={progress} />
        </div>

        {/* Quarterly Details (Expandable) */}
        {isExpanded && !isInactive && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <h5 className="text-sm font-semibold text-slate-700 mb-3">
              รายละเอียดรายไตรมาส
            </h5>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((q) => {
                const quarterData = kpi.quarterlyData.find((qd) => qd.quarter === q);
                const statusColor = {
                  PASSED: 'text-green-600',
                  FAILED: 'text-red-600',
                  PENDING: 'text-orange-500',
                  ERROR: 'text-slate-400',
                }[quarterData?.status || 'PENDING'];

                return (
                  <div
                    key={q}
                    className="bg-white p-3 rounded-lg border border-slate-200 relative group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="text-sm font-semibold text-slate-700">
                        ไตรมาส {q}
                      </div>
                      {quarterData && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            setEditingQuarter({
                              id: quarterData.id,
                              quarter: q,
                              target: quarterData.quarterlyTarget || '',
                              result: quarterData.result || '',
                            })
                          }
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>
                        เป้า: <span className="font-medium text-slate-900">{quarterData?.quarterlyTarget || '-'}</span>
                      </div>
                      <div>
                        ผล:{' '}
                        <span className={`font-bold ${statusColor}`}>
                          {quarterData?.result || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <KpiEditDialog
        kpiId={kpi.kpiId}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        initialData={{
          name: kpi.kpiName,
          targetText: kpi.targetText || '',
          fiveYearTargetText: kpi.fiveYearTargetText || '',
          fiveYearTargetValue: kpi.fiveYearTargetValue || 0,
          calcLogic: kpi.calcLogic,
          owner: kpi.owner || '',
          isActive: kpi.isActive,
        }}
      />

      {/* Quarterly Edit Dialog */}
      {editingQuarter && (
        <QuarterlyEditDialog
          quarterlyId={editingQuarter.id}
          kpiName={kpi.kpiName}
          year={kpi.year}
          quarter={editingQuarter.quarter}
          isOpen={true}
          onClose={() => setEditingQuarter(null)}
          initialData={{
            quarterlyTarget: editingQuarter.target,
            result: editingQuarter.result,
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ KPI</AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจหรือไม่ที่จะลบ KPI นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              <br />
              <br />
              <strong className="text-slate-900">{kpi.kpiName}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              ลบ KPI
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to calculate progress percentage
function calculateProgress(
  current: string | null,
  target: string | null,
  logic: string
): number {
  if (!current || current === '') return 0;

  const currentValue = parseFloat(current);
  const targetValue = parseFloat(target || '0');

  if (isNaN(currentValue)) return 0;

  if (logic === 'EQ0') {
    return currentValue === 0 ? 100 : 0;
  }

  if (logic === 'EQT') {
    return current.trim() === (target || '').trim() ? 100 : 0;
  }

  if (isNaN(targetValue) || targetValue === 0) {
    return logic === 'GTE' && currentValue > 0 ? 100 : 0;
  }

  let percent =
    logic === 'LTE'
      ? (targetValue / currentValue) * 100
      : (currentValue / targetValue) * 100;

  if (logic === 'LTE' && currentValue <= targetValue) {
    percent = 100;
  }

  return Math.max(0, Math.min(Math.round(percent), 100));
}
