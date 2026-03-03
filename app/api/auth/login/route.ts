import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieName,
  sessionMaxAge,
} from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { isValidEmail, normalizeEmail } from "@/lib/auth/validation";
import { getUserByEmail } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = await createSessionToken(user.id);
    const response = NextResponse.json({
      user: { id: user.id, email: user.email },
    });

    response.cookies.set({
      name: sessionCookieName,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionMaxAge,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unable to log in" }, { status: 500 });
  }
}
