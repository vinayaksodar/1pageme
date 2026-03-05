import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getSessionStatusFromRequest } from "@/lib/auth/session";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { status, userId } = await getSessionStatusFromRequest(request);

    if (status !== "valid" || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Explicitly block files larger than 512KB to prevent abuse
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 512 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds the 512KB limit" },
        { status: 413 },
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      );
    }

    if (!request.body) {
      return NextResponse.json({ error: "No body provided" }, { status: 400 });
    }

    const blob = await put(filename, request.body, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
