import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";

const secretString =
  process.env.JWT_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  "qfind_jwt_secure_session_secret_2026_key_fallback";
const SECRET_KEY = new TextEncoder().encode(secretString);

const ADMIN_EMAILS = [
  "leonelmartin9808@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
]
  .filter(Boolean)
  .map((e) => e.toLowerCase().trim());

export interface SessionPayload {
  userId: number;
  email: string;
  name: string;
  picture?: string | null;
  admin: boolean;
}

export function isEmailAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

const googleClient = new OAuth2Client(
  (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim().replace(/^["']|["']$/g, "")
);

export async function verifyGoogleToken(idToken: string) {
  try {
    const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "")
      .trim()
      .replace(/^["']|["']$/g, "");
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error("Google verify token error:", error);
    return null;
  }
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("qfind_session")?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        foto: true,
        admin: true,
      },
    });

    if (!user) return null;

    const isAdmin = Boolean(user.admin || isEmailAdmin(user.email));

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      foto: user.foto,
      admin: isAdmin,
    };
  } catch {
    return null;
  }
}

export async function verifyAdminSession() {
  const user = await getSessionUser();
  if (!user || !user.admin) return null;
  return user;
}
