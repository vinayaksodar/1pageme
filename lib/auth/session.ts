import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "resume_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

const getSessionSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }
  return new TextEncoder().encode(secret);
};

export const createSessionToken = async (userId: string) => {
  const secret = getSessionSecret();
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ONE_WEEK_SECONDS}s`)
    .sign(secret);
};

export const verifySessionToken = async (token: string) => {
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return payload.sub;
  } catch {
    return null;
  }
};

export const getUserIdFromRequest = async (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
};

export const getSessionStatusFromRequest = async (
  request: NextRequest,
): Promise<{
  status: "valid" | "expired" | "no-session";
  userId: string | null;
}> => {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return { status: "no-session", userId: null };
  }
  const userId = await verifySessionToken(token);
  if (!userId) {
    return { status: "expired", userId: null };
  }
  return { status: "valid", userId };
};

export const sessionCookieName = SESSION_COOKIE_NAME;
export const sessionMaxAge = ONE_WEEK_SECONDS;
