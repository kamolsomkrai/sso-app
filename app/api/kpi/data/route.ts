import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

// Helper function to calculate KPI status
function calculateStatus(
  result: string | null,
  target: string | null,
  calcLogic: string
): 'PASSED' | 'FAILED' | 'PENDING' | 'ERROR' {
  if (!result || !target || result === '' || target === '') {
    return 'PENDING';
  }

  const resultValue = parseFloat(result);
  const targetValue = parseFloat(target);

  if (isNaN(resultValue) || isNaN(targetValue)) {
    // Check for text-based comparison
    if (calcLogic === 'EQT' && result.trim() === target.trim()) {
      return 'PASSED';
    }
    return 'ERROR';
  }

  switch (calcLogic) {
    case 'GTE':
      return resultValue >= targetValue ? 'PASSED' : 'FAILED';
    case 'LTE':
      return resultValue <= targetValue ? 'PASSED' : 'FAILED';
    case 'EQ0':
      return resultValue === 0 ? 'PASSED' : 'FAILED';
    case 'EQT':
      return result.trim() === target.trim() ? 'PASSED' : 'FAILED';
    default:
      return resultValue >= targetValue ? 'PASSED' : 'FAILED';
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const indicatorId = searchParams.get('indicatorId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const strategyId = searchParams.get('strategyId');

    // Build where clause
    const where: any = {
      quarterlyData: {
        some: {
          year,
        },
      },
    };

    if (indicatorId) {
      where.indicatorId = indicatorId;
    }

    if (strategyId) {
      where.objective = {
        OR: [
          { strategyId },
          { plan: { strategyId } },
        ],
      };
    }

    // Fetch KPI data with all relations
    const kpis = await db.kpiMaster.findMany({
      where,
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
        quarterlyData: {
          where: { year },
          orderBy: { quarter: 'asc' },
        },
        annualData: {
          orderBy: { year: 'asc' },
        },
      },
    });

    // Transform data for frontend
    const transformedData = kpis.map((kpi) => {
      // Calculate quarterly statuses
      const quarterlyWithStatus = kpi.quarterlyData.map((q) => ({
        ...q,
        status: calculateStatus(q.result, q.quarterlyTarget, kpi.calcLogic),
      }));

      // Get strategy info (from objective or plan)
      const strategy = kpi.objective.strategy || kpi.objective.plan?.strategy;

      return {
        kpiId: kpi.id,
        kpiCode: kpi.code,
        kpiName: kpi.name,
        targetText: kpi.targetText,
        owner: kpi.owner,
        calcLogic: kpi.calcLogic,
        isActive: kpi.isActive,
        fiveYearPlanPeriod: kpi.fiveYearPlanPeriod,
        fiveYearTargetText: kpi.fiveYearTargetText,
        fiveYearTargetValue: kpi.fiveYearTargetValue,
        
        // Hierarchy
        indicatorId: kpi.indicator.code,
        indicatorName: kpi.indicator.name,
        strategyId: strategy?.code,
        strategyName: strategy?.name,
        planName: kpi.objective.plan?.name,
        objectiveName: kpi.objective.name,

        // Data
        year,
        quarterlyData: quarterlyWithStatus,
        annualData: kpi.annualData,
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('KPI Data API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI data' },
      { status: 500 }
    );
  }
}
