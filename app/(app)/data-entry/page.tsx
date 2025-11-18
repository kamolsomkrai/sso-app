import { ActualEntryForm } from '@/components/data-entry/actual-entry-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DataEntryPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>บันทึกยอดใช้จริง (Actual Entry)</CardTitle>
          <CardDescription>
            กรอกข้อมูลรายรับ หรือรายจ่ายที่เกิดขึ้นจริง
            เลือกหมวดหมู่และกรอกจำนวนเงิน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActualEntryForm />
        </CardContent>
      </Card>
    </div>
  );
}