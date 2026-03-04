import { NextRequest, NextResponse } from "next/server";
import { getSessionStatusFromRequest } from "@/lib/auth/session";
import { getUserById } from "@/lib/db/users";

export async function GET(request: NextRequest) {
  try {
    const { status, userId } = await getSessionStatusFromRequest(request);

    if (status === "expired") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch user" },
      { status: 500 },
    );
  }
}
