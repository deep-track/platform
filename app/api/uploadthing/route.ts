import { createRouteHandler } from "uploadthing/next";
import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";

import { ourFileRouter } from "./core";

const handler = createRouteHandler({
  router: ourFileRouter,
});

const utapi = new UTApi();

export const GET = handler.GET;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const maybeFile = formData.get("file");

    if (!(maybeFile instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const uploaded = await utapi.uploadFiles(maybeFile);

    if (uploaded.error) {
      return NextResponse.json(
        { error: uploaded.error.message ?? "Upload failed" },
        { status: 400 },
      );
    }

    const url = uploaded.data?.ufsUrl ?? uploaded.data?.url;
    if (!url) {
      return NextResponse.json({ error: "No URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/uploadthing]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
