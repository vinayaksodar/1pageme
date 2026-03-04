import { NextRequest, NextResponse } from "next/server";
import {
  deleteResume,
  getResumeByIdForOwner,
  updateResume,
} from "@/lib/db/resumes";
import { isResumeData } from "@/lib/db/validation";
import { getUserIdFromRequest } from "@/lib/auth/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await getUserIdFromRequest(request);
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const row = await getResumeByIdForOwner(id, ownerId);
    if (!row) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ resume: row });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch resume" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await getUserIdFromRequest(request);
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const resume = body?.resume;
    const lastSyncedVersion = body?.lastSyncedVersion;

    if (!isResumeData(resume)) {
      return NextResponse.json(
        { error: "Invalid resume payload" },
        { status: 400 },
      );
    }

    if (resume.id !== id) {
      return NextResponse.json(
        { error: "Resume ID in payload does not match route ID" },
        { status: 400 },
      );
    }

    const updated = await updateResume(id, ownerId, resume, lastSyncedVersion);
    if (!updated) {
      console.log(`[RESUMES:PUT] Resume ${id} not found for owner ${ownerId}`);
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    console.log(`[RESUMES:PUT] Successfully updated resume ${id}`);
    return NextResponse.json({ resume: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "CONFLICT") {
      return NextResponse.json(
        { error: "Conflict: Resume has been updated elsewhere" },
        { status: 409 },
      );
    }
    console.error("[RESUMES:PUT] Error updating resume:", error);
    return NextResponse.json(
      {
        error: "Unable to update resume",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await getUserIdFromRequest(request);
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await deleteResume(id, ownerId);
    if (!deleted) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: deleted.id });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete resume" },
      { status: 500 },
    );
  }
}
