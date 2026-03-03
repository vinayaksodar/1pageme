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
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/auth/validation";
import { createUser, getUserByEmail } from "@/lib/db/users";

export async function POST(request: Request) {
  try {
    if (!process.env.AUTH_SECRET) {
      console.error("[AUTH:REGISTER] AUTH_SECRET is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const email =
      typeof body?.email === "string" ? normalizeEmail(body.email) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    console.log(`[AUTH:REGISTER] Request received for email: ${email}`);

    if (!isValidEmail(email)) {
      console.log(`[AUTH:REGISTER] Invalid email format: ${email}`);
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    if (!isValidPassword(password)) {
      console.log(`[AUTH:REGISTER] Password too short for email: ${email}`);
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        },
        { status: 400 },
      );
    }

    console.log(`[AUTH:REGISTER] Checking if user exists for email: ${email}`);
    const existing = await getUserByEmail(email);
    if (existing) {
      console.log(`[AUTH:REGISTER] User already exists: ${email}`);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 },
      );
    }

    console.log(`[AUTH:REGISTER] Hashing password for email: ${email}`);
    const passwordHash = await hashPassword(password);

    console.log(
      `[AUTH:REGISTER] Attempting to create user in database for email: ${email}`,
    );
    const user = await createUser(email, passwordHash);
    console.log(
      `[AUTH:REGISTER] User created successfully with ID: ${user.id}`,
    );

    const token = await createSessionToken(user.id);
    console.log(
      `[AUTH:REGISTER] Session token created for user ID: ${user.id}`,
    );

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

    console.log(`[AUTH:REGISTER] Registration complete for email: ${email}`);
    return response;
  } catch (error) {
    console.error("[AUTH:REGISTER] Error during registration:", error);
    return NextResponse.json(
      {
        error: "Unable to register user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
