import { NextRequest, NextResponse } from "next/server";
import { searchSanctions } from "@/lib/opensanctions";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      fullName?: string;
      country?: string;
    };

    if (!body.fullName || body.fullName.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    const result = await searchSanctions(body.fullName, body.country);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("[POST /api/aml/search]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
