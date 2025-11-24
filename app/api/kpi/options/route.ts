import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Fetch all unique 5-year plan periods
    const planPeriods = await db.kpiMaster.findMany({
      where: {
        fiveYearPlanPeriod: {
          not: null,
        },
      },
      select: {
        fiveYearPlanPeriod: true,
      },
      distinct: ['fiveYearPlanPeriod'],
      orderBy: {
        fiveYearPlanPeriod: 'desc',
      },
    });

    // Fetch all indicators
    const indicators = await db.kpiIndicator.findMany({
      orderBy: {
        code: 'asc',
      },
    });

    return NextResponse.json({
      planPeriods: planPeriods
        .filter((p) => p.fiveYearPlanPeriod)
        .map((p) => p.fiveYearPlanPeriod),
      indicators: indicators.map((i) => ({
        id: i.id,
        code: i.code,
        name: i.name,
      })),
    });
  } catch (error) {
    console.error('KPI Options API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI options' },
      { status: 500 }
    );
  }
}
