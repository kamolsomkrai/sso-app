"use client";

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface KpiEditDialogProps {
  kpiId: string;
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    name: string;
    targetText: string;
    fiveYearTargetText: string;
    fiveYearTargetValue: number;
    calcLogic: string;
    owner: string;
    isActive: boolean;
  };
}

export function KpiEditDialog({
  kpiId,
  isOpen,
  onClose,
  initialData,
}: KpiEditDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      targetText: '',
      fiveYearTargetText: '',
      fiveYearTargetValue: 0,
      calcLogic: 'GTE',
      owner: '',
      isActive: true,
    }
  );

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.put(`/api/kpi/${kpiId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
      queryClient.invalidateQueries({ queryKey: ['strategy-summary'] });
      toast.success('บันทึกข้อมูล KPI สำเร็จ');
      onClose();
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูล KPI</DialogTitle>
          <DialogDescription>
            แก้ไขรายละเอียดและเป้าหมายของ KPI
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* KPI Name */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ KPI</Label>
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

          {/* 5-Year Target */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">เปิดใช้งาน KPI นี้</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
