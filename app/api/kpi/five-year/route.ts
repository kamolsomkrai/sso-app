import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const planPeriod = searchParams.get('planPeriod'); // e.g., "2569-2573"
    const indicatorId = searchParams.get('indicatorId');

    if (!planPeriod) {
      return NextResponse.json(
        { error: 'planPeriod is required' },
        { status: 400 }
      );
    }

    // Fetch KPIs for the 5-year plan period
    const kpis = await db.kpiMaster.findMany({
      where: {
        fiveYearPlanPeriod: planPeriod,
        ...(indicatorId && { indicatorId }),
      },
      include: {
        indicator: true,
        objective: {
          include: {
            strategy: true,
            plan: {
              include: {
                strategy: true,
              },
            },
          },
        },
        annualData: {
          orderBy: { year: 'asc' },
        },
      },
    });

    // Group by strategy
    const groupedByStrategy: Record<string, any> = {};

    kpis.forEach((kpi) => {
      const strategy = kpi.objective.strategy || kpi.objective.plan?.strategy;
      if (!strategy) return;

      if (!groupedByStrategy[strategy.id]) {
        groupedByStrategy[strategy.id] = {
          strategyId: strategy.id,
          strategyCode: strategy.code,
          strategyName: strategy.name,
          kpis: [],
        };
      }

      groupedByStrategy[strategy.id].kpis.push({
        kpiId: kpi.id,
        kpiCode: kpi.code,
        kpiName: kpi.name,
        objectiveName: kpi.objective.name,
        planName: kpi.objective.plan?.name,
        fiveYearTargetText: kpi.fiveYearTargetText,
        fiveYearTargetValue: kpi.fiveYearTargetValue,
        calcLogic: kpi.calcLogic,
        isActive: kpi.isActive,
        annualData: kpi.annualData.map((data) => ({
          year: data.year,
          target: data.yearTarget,
          result: data.yearResult,
        })),
      });
    });

    const result = Object.values(groupedByStrategy);

    return NextResponse.json(result);
  } catch (error) {
    console.error('5-Year Plan API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch 5-year plan data' },
      { status: 500 }
    );
  }
}
