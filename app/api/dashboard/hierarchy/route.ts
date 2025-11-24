import { NextResponse } from "next/server";
import { getHierarchyData } from "@/lib/services/dashboard-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fiscalYear = parseInt(searchParams.get("fiscalYear") || "2567");

    const data = await getHierarchyData(fiscalYear);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Dashboard Hierarchy Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
