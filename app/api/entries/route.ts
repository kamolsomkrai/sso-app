// app/api/entries/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for validation
const entrySchema = z.object({
  userId: z.string().min(1),
  entryDate: z.string().datetime(),
  amount: z.number().positive(),
  fiscalYear: z.number(),
  month: z.number().min(1).max(12),
  categoryId: z.string().min(1),
  procurementItemId: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate input
    const validation = entrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      userId,
      entryDate,
      amount,
      fiscalYear,
      month,
      categoryId,
      procurementItemId,
      quantity,
      notes,
    } = validation.data;

    // 2. Create Entry
    const newEntry = await prisma.monthlyActualEntry.create({
      data: {
        entryDate: new Date(entryDate),
        amount: amount,
        fiscalYear: fiscalYear,
        month: month,
        notes: notes,
        quantity: quantity,
        recordedById: userId,
        categoryId: categoryId,
        procurementItemId: procurementItemId, // This can be null
      },
    });

    // 3. (Optional) Update Inventory if item is provided
    if (procurementItemId && quantity) {
      // Assuming positive quantity is "adding" to stock (e.g., procurement)
      // If it's "using" stock, quantity should be negative.
      // Let's assume for this form, positive quantity = using stock (expense)
      // *** Note: Logic for inventory update needs clarification.
      // For now, we just create the entry.
      // Example:
      // await prisma.procurementItem.update({
      //   where: { id: procurementItemId },
      //   data: {
      //     inventory: {
      //       decrement: quantity, // or increment
      //     },
      //   },
      // });
    }

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("API Error: /api/entries [POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Zod validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
