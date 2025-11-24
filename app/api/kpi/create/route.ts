import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { KpiCalcLogic } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      name,
      targetText,
      fiveYearTargetText,
      fiveYearTargetValue,
      fiveYearPlanPeriod,
      calcLogic,
      owner,
      objectiveId,
      indicatorId,
    } = body;

    // Validate required fields
    if (!code || !name || !objectiveId || !indicatorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await db.kpiMaster.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'KPI code already exists' },
        { status: 409 }
      );
    }

    // Create KPI
    const newKpi = await db.kpiMaster.create({
      data: {
        code,
        name,
        targetText: targetText || null,
        fiveYearTargetText: fiveYearTargetText || null,
        fiveYearTargetValue: fiveYearTargetValue
          ? Number(fiveYearTargetValue)
          : null,
        fiveYearPlanPeriod: fiveYearPlanPeriod || null,
        calcLogic: (calcLogic as KpiCalcLogic) || 'GTE',
        owner: owner || null,
        isActive: true,
        objectiveId,
        indicatorId,
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

    return NextResponse.json(newKpi, { status: 201 });
  } catch (error) {
    console.error('Create KPI Error:', error);
    return NextResponse.json(
      { error: 'Failed to create KPI' },
      { status: 500 }
    );
  }
}
