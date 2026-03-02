import { NextResponse } from "next/server";
import {
  createSessionToken,
  sessionCookieName,
  sessionMaxAge,
} from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import {
  isValidEmail,
  isValidPassword,
  normalizeEmail,
} from "@/lib/auth/validation";
import { createUser, getUserByEmail } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return NextResponse.json(
        { error: "Email or password is invalid" },
        { status: 400 },
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);
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
    return NextResponse.json(
      { error: "Unable to register user" },
      { status: 500 },
    );
  }
}
