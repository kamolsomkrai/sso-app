import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { KpiStatus } from '@prisma/client';

// PUT - Update quarterly data
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { result, quarterlyTarget, status } = body;

    const updated = await db.kpiQuarterlyData.update({
      where: { id: params.id },
      data: {
        ...(result !== undefined && { result }),
        ...(quarterlyTarget !== undefined && { quarterlyTarget }),
        ...(status && { status: status as KpiStatus }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update Quarterly Data Error:', error);
    return NextResponse.json(
      { error: 'Failed to update quarterly data' },
      { status: 500 }
    );
  }
}

// POST - Create new quarterly data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kpiId, year, quarter, quarterlyTarget, result, status } = body;

    const newData = await db.kpiQuarterlyData.create({
      data: {
        kpiId,
        year: Number(year),
        quarter: Number(quarter),
        quarterlyTarget,
        result: result || null,
        status: (status as KpiStatus) || 'PENDING',
      },
    });

    return NextResponse.json(newData);
  } catch (error) {
    console.error('Create Quarterly Data Error:', error);
    return NextResponse.json(
      { error: 'Failed to create quarterly data' },
      { status: 500 }
    );
  }
}
