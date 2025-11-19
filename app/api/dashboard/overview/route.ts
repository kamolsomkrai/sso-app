import { NextResponse } from "next/server";
import { getExecutiveSummary } from "@/lib/services/dashboard-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Parameters
    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "2567");

    // 3. Call Service
    const summary = await getExecutiveSummary(fiscalYear);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[API] Dashboard Overview Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
