import { KpiData, StrategySummary } from './kpi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportKpiToExcel(
  data: KpiData[],
  strategySummary: StrategySummary[],
  year: number,
  indicatorName: string
) {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = strategySummary.map((s) => ({
    'ยุทธศาสตร์': s.strategyName,
    'KPI ทั้งหมด': s.totalKpis,
    'ผ่าน': s.passedKpis,
    'ไม่ผ่าน': s.failedKpis,
    'รอข้อมูล': s.pendingKpis,
    'อัตราความสำเร็จ (%)': s.completionRate.toFixed(2),
  }));
  const ws1 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'สรุปภาพรวม');

  // Sheet 2: KPI Details
  const kpiDetails = data.map((kpi) => ({
    'รหัส KPI': kpi.kpiCode,
    'ชื่อ KPI': kpi.kpiName,
    'ยุทธศาสตร์': kpi.strategyName,
    'Objective': kpi.objectiveName,
    'เป้าหมาย': kpi.targetText,
    'ผู้รับผิดชอบ': kpi.owner || '-',
    'สถานะ': kpi.isActive ? 'ใช้งาน' : 'ยกเลิก',
  }));
  const ws2 = XLSX.utils.json_to_sheet(kpiDetails);
  XLSX.utils.book_append_sheet(wb, ws2, 'รายการ KPI');

  // Sheet 3: Quarterly Data
  const quarterlyData: any[] = [];
  data.forEach((kpi) => {
    kpi.quarterlyData.forEach((q) => {
      quarterlyData.push({
        'รหัส KPI': kpi.kpiCode,
        'ชื่อ KPI': kpi.kpiName,
        'ไตรมาส': `Q${q.quarter}`,
        'เป้าหมาย': q.quarterlyTarget || '-',
        'ผลลัพธ์': q.result || '-',
        'สถานะ': q.status,
      });
    });
  });
  const ws3 = XLSX.utils.json_to_sheet(quarterlyData);
  XLSX.utils.book_append_sheet(wb, ws3, 'ข้อมูลรายไตรมาส');

  // Write file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(
    blob,
    `KPI_Dashboard_${indicatorName}_${year}_${
      new Date().toISOString().split('T')[0]
    }.xlsx`
  );
}

export function exportFiveYearToExcel(
  data: any[],
  planPeriod: string,
  indicatorName: string
) {
  const wb = XLSX.utils.book_new();

  // Create sheet with annual data
  const annualData: any[] = [];
  data.forEach((strategy) => {
    strategy.kpis.forEach((kpi: any) => {
      kpi.annualData.forEach((annual: any) => {
        annualData.push({
          'ยุทธศาสตร์': strategy.strategyName,
          'รหัส KPI': kpi.kpiCode,
          'ชื่อ KPI': kpi.kpiName,
          'ปี': annual.year,
          'เป้าหมาย': annual.yearTarget || '-',
          'ผลลัพธ์': annual.yearResult || '-',
        });
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(annualData);
  XLSX.utils.book_append_sheet(wb, ws, 'แผน 5 ปี');

  // Write file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(
    blob,
    `KPI_5Year_${indicatorName}_${planPeriod}_${
      new Date().toISOString().split('T')[0]
    }.xlsx`
  );
}
