import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { batchMatchEntities, OpenSanctionsEntity, getPrimaryMatch } from "@/lib/opensanctions";

interface ScreeningRequest {
  entities: Array<{
    id: string;
    name: string;
    data: OpenSanctionsEntity;
  }>;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ScreeningRequest;

    if (!body.entities || !Array.isArray(body.entities) || body.entities.length === 0) {
      return NextResponse.json(
        { error: "entities array is required and must not be empty" },
        { status: 400 }
      );
    }

    console.log(`[Screening] Processing ${body.entities.length} entities`);

    // Call OpenSanctions API for batch matching
    const results = await batchMatchEntities(
      body.entities.map((e) => ({ id: e.id, data: e.data }))
    );

    // Store results in database
    const screeningResults = await Promise.all(
      body.entities.map(async (entity) => {
        const matches = results[entity.id] || [];
        const primaryMatch = getPrimaryMatch(matches);

        const record = await prisma.screeningResult.create({
          data: {
            entityId: entity.id,
            entityName: entity.name,
            schema: entity.data.schema,
            matchFound: matches.length > 0 && !!primaryMatch,
            matchCount: matches.length,
            primaryMatchId: primaryMatch?.id,
            primaryMatchCaption: primaryMatch?.caption,
            matchScore: primaryMatch?.score,
            matchDatasets: primaryMatch?.datasets || [],
            rawResponse: {
              queryId: entity.id,
              matchResults: matches.map((m) => ({
                id: m.id,
                caption: m.caption,
                score: m.score,
                datasets: m.datasets,
              })),
              timestamp: new Date().toISOString(),
            },
          },
        });

        return {
          entityId: entity.id,
          name: entity.name,
          matchFound: record.matchFound,
          matchCount: matches.length,
          primaryMatch: primaryMatch ? {
            id: primaryMatch.id,
            caption: primaryMatch.caption,
            score: primaryMatch.score,
            datasets: primaryMatch.datasets,
          } : null,
          screeningId: record.id,
        };
      })
    );

    return NextResponse.json({
      success: true,
      processed: screeningResults.length,
      results: screeningResults,
    });
  } catch (error) {
    console.error("[Screening API] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Screening failed: ${message}` },
      { status: 500 }
    );
  }
}
