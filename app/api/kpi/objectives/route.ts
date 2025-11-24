import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const objectives = await db.kpiObjective.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        strategyId: true,
        strategy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    return NextResponse.json(objectives);
  } catch (error) {
    console.error('Get Objectives Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch objectives' },
      { status: 500 }
    );
  }
}
