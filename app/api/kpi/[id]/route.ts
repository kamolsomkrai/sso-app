import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { KpiCalcLogic } from '@prisma/client';

// GET - Fetch single KPI by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kpi = await db.kpiMaster.findUnique({
      where: { id: params.id },
      include: {
        indicator: true,
        objective: {
          include: {
            strategy: true,
            plan: true,
          },
        },
        quarterlyData: {
          orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
        },
        annualData: {
          orderBy: { year: 'desc' },
        },
      },
    });

    if (!kpi) {
      return NextResponse.json({ error: 'KPI not found' }, { status: 404 });
    }

    return NextResponse.json(kpi);
  } catch (error) {
    console.error('Get KPI Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI' },
      { status: 500 }
    );
  }
}

// PUT - Update KPI
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      name,
      targetText,
      fiveYearTargetText,
      fiveYearTargetValue,
      calcLogic,
      owner,
      isActive,
    } = body;

    const updatedKpi = await db.kpiMaster.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(targetText !== undefined && { targetText }),
        ...(fiveYearTargetText !== undefined && { fiveYearTargetText }),
        ...(fiveYearTargetValue !== undefined && { 
          fiveYearTargetValue: Number(fiveYearTargetValue) 
        }),
        ...(calcLogic && { calcLogic: calcLogic as KpiCalcLogic }),
        ...(owner !== undefined && { owner }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        indicator: true,
        objective: {
          include: {
            strategy: true,
          },
        },
      },
    });

    return NextResponse.json(updatedKpi);
  } catch (error) {
    console.error('Update KPI Error:', error);
    return NextResponse.json(
      { error: 'Failed to update KPI' },
      { status: 500 }
    );
  }
}

// DELETE - Delete KPI
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete related data first (cascade should handle this, but being explicit)
    await db.kpiQuarterlyData.deleteMany({
      where: { kpiId: params.id },
    });

    await db.kpiAnnualData.deleteMany({
      where: { kpiId: params.id },
    });

    // Delete the KPI
    await db.kpiMaster.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete KPI Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete KPI' },
      { status: 500 }
    );
  }
}
