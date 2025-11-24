import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const indicatorId = searchParams.get('indicatorId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Fetch all strategies with their KPIs
    const strategies = await db.kpiStrategy.findMany({
      include: {
        objectives: {
          include: {
            kpis: {
              where: {
                ...(indicatorId && { indicatorId }),
                quarterlyData: {
                  some: { year },
                },
              },
              include: {
                quarterlyData: {
                  where: { year },
                },
              },
            },
          },
        },
        plans: {
          include: {
            objectives: {
              include: {
                kpis: {
                  where: {
                    ...(indicatorId && { indicatorId }),
                    quarterlyData: {
                      some: { year },
                    },
                  },
                  include: {
                    quarterlyData: {
                      where: { year },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate summary for each strategy
    const summary = strategies.map((strategy) => {
      // Collect all KPIs from objectives and plans
      const allKpis = [
        ...strategy.objectives.flatMap((obj) => obj.kpis),
        ...strategy.plans.flatMap((plan) => 
          plan.objectives.flatMap((obj) => obj.kpis)
        ),
      ];

      // Remove duplicates
      const uniqueKpis = Array.from(
        new Map(allKpis.map((kpi) => [kpi.id, kpi])).values()
      );

      // Count passed KPIs (at least one quarter passed)
      const passedKpis = uniqueKpis.filter((kpi) =>
        kpi.quarterlyData.some((q) => q.status === 'PASSED')
      ).length;

      const failedKpis = uniqueKpis.filter((kpi) =>
        kpi.quarterlyData.some((q) => q.status === 'FAILED')
      ).length;

      const pendingKpis = uniqueKpis.length - passedKpis - failedKpis;

      return {
        strategyId: strategy.id,
        strategyCode: strategy.code,
        strategyName: strategy.name,
        totalKpis: uniqueKpis.length,
        passedKpis,
        failedKpis,
        pendingKpis,
        completionRate:
          uniqueKpis.length > 0
            ? Math.round((passedKpis / uniqueKpis.length) * 100)
            : 0,
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Strategy Summary API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategy summary' },
      { status: 500 }
    );
  }
}
