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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuarterlyEditDialogProps {
  quarterlyId: string;
  kpiName: string;
  year: number;
  quarter: number;
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    quarterlyTarget: string;
    result: string;
  };
}

export function QuarterlyEditDialog({
  quarterlyId,
  kpiName,
  year,
  quarter,
  isOpen,
  onClose,
  initialData,
}: QuarterlyEditDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(
    initialData || {
      quarterlyTarget: '',
      result: '',
    }
  );

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await axios.put(`/api/kpi/quarterly/${quarterlyId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-data'] });
      toast.success('บันทึกข้อมูลรายไตรมาสสำเร็จ');
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลรายไตรมาส</DialogTitle>
          <DialogDescription>
            {kpiName} - ไตรมาส {quarter} ปี {year}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quarterly Target */}
          <div className="space-y-2">
            <Label htmlFor="quarterlyTarget">เป้าหมายรายไตรมาส</Label>
            <Input
              id="quarterlyTarget"
              value={formData.quarterlyTarget}
              onChange={(e) =>
                setFormData({ ...formData, quarterlyTarget: e.target.value })
              }
              placeholder="เช่น 80 หรือ ระดับ 3"
            />
          </div>

          {/* Result */}
          <div className="space-y-2">
            <Label htmlFor="result">ผลลัพธ์</Label>
            <Input
              id="result"
              value={formData.result}
              onChange={(e) =>
                setFormData({ ...formData, result: e.target.value })
              }
              placeholder="เช่น 85 หรือ ระดับ 4"
            />
            <p className="text-xs text-slate-500">
              ระบบจะคำนวณสถานะ (ผ่าน/ไม่ผ่าน) อัตโนมัติ
            </p>
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
