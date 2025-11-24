"use client";

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface KpiCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KpiCreateDialog({ isOpen, onClose }: KpiCreateDialogProps) {
  const queryClient = useQueryClient();
  
  // Fetch objectives and indicators for dropdowns
  const { data: objectives } = useQuery({
    queryKey: ['objectives-list'],
    queryFn: async () => {
      const { data } = await axios.get('/api/kpi/objectives');
      return data;
    },
    enabled: isOpen,
  });

  const { data: indicators } = useQuery({
    queryKey: ['indicators-list'],
    queryFn: async () => {
      const { data } = await axios.get('/api/kpi/options');
      return data.indicators;
    },
    enabled: isOpen,
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    targetText: '',
    fiveYearTargetText: '',
    fiveYearTargetValue: 0,
    fiveYearPlanPeriod: '2569-2573',
    calcLogic: 'GTE',
    owner: '',
    objectiveId: '',
    indicatorId: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.post('/api/kpi/create', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-summary'] });
      toast.success('สร้าง KPI สำเร็จ');
      onClose();
      setFormData({
        code: '',
        name: '',
        targetText: '',
        fiveYearTargetText: '',
        fiveYearTargetValue: 0,
        fiveYearPlanPeriod: '2569-2573',
        calcLogic: 'GTE',
        owner: '',
        objectiveId: '',
        indicatorId: '',
      });
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้าง KPI');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.objectiveId || !formData.indicatorId) {
      toast.error('กรุณาเลือก Objective และ Indicator');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>สร้าง KPI ใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูล KPI และเป้าหมาย
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* KPI Code */}
            <div className="space-y-2">
              <Label htmlFor="code">รหัส KPI *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="เช่น KPI21"
                required
              />
            </div>

            {/* Owner */}
            <div className="space-y-2">
              <Label htmlFor="owner">ผู้รับผิดชอบ</Label>
              <Input
                id="owner"
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
                placeholder="เช่น กลุ่มงานการเงิน"
              />
            </div>
          </div>

          {/* KPI Name */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ KPI *</Label>
            <Textarea
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Objective */}
            <div className="space-y-2">
              <Label htmlFor="objectiveId">Objective *</Label>
              <Select
                value={formData.objectiveId}
                onValueChange={(value) =>
                  setFormData({ ...formData, objectiveId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือก Objective" />
                </SelectTrigger>
                <SelectContent>
                  {objectives?.map((obj: any) => (
                    <SelectItem key={obj.id} value={obj.id}>
                      {obj.code} - {obj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indicator */}
            <div className="space-y-2">
              <Label htmlFor="indicatorId">ระดับตัวชี้วัด *</Label>
              <Select
                value={formData.indicatorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, indicatorId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกระดับ" />
                </SelectTrigger>
                <SelectContent>
                  {indicators?.map((ind: any) => (
                    <SelectItem key={ind.id} value={ind.id}>
                      {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Text */}
          <div className="space-y-2">
            <Label htmlFor="targetText">เป้าหมาย (ข้อความ)</Label>
            <Input
              id="targetText"
              value={formData.targetText}
              onChange={(e) =>
                setFormData({ ...formData, targetText: e.target.value })
              }
              placeholder="เช่น มากกว่าหรือเท่ากับร้อยละ 80"
            />
          </div>

          {/* 5-Year Plan */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiveYearPlanPeriod">ช่วงแผน 5 ปี</Label>
              <Input
                id="fiveYearPlanPeriod"
                value={formData.fiveYearPlanPeriod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fiveYearPlanPeriod: e.target.value,
                  })
                }
                placeholder="2569-2573"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiveYearTargetText">เป้าหมาย 5 ปี (ข้อความ)</Label>
              <Input
                id="fiveYearTargetText"
                value={formData.fiveYearTargetText}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fiveYearTargetText: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiveYearTargetValue">เป้าหมาย 5 ปี (ตัวเลข)</Label>
              <Input
                id="fiveYearTargetValue"
                type="number"
                step="0.01"
                value={formData.fiveYearTargetValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fiveYearTargetValue: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Calculation Logic */}
          <div className="space-y-2">
            <Label htmlFor="calcLogic">วิธีการคำนวณ</Label>
            <Select
              value={formData.calcLogic}
              onValueChange={(value) =>
                setFormData({ ...formData, calcLogic: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GTE">มากกว่าหรือเท่ากับ (≥)</SelectItem>
                <SelectItem value="LTE">น้อยกว่าหรือเท่ากับ (≤)</SelectItem>
                <SelectItem value="EQ0">เท่ากับ 0</SelectItem>
                <SelectItem value="EQT">เท่ากับเป้าหมาย (ข้อความ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              สร้าง KPI
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
