import { NextRequest, NextResponse } from "next/server";
import { createResume, listResumesByOwner } from "@/lib/db/resumes";
import { isResumeData } from "@/lib/db/validation";
import { getUserIdFromRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const ownerId = await getUserIdFromRequest(request);
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumes = await listResumesByOwner(ownerId);
    return NextResponse.json({ resumes });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch resumes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ownerId = await getUserIdFromRequest(request);
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const resume = body?.resume;

    if (!isResumeData(resume)) {
      return NextResponse.json(
        { error: "Invalid resume payload" },
        { status: 400 },
      );
    }

    const created = await createResume(ownerId, resume);
    return NextResponse.json({ resume: created }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "Resume with this ID already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Unable to create resume" },
      { status: 500 },
    );
  }
}
