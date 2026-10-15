import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import type { User } from "@/lib/types";

export const SESSION_COOKIE = "lp_session";

// Simple hash using Node crypto (no external deps needed)
function hashPassword(password: string): string {
  // demo-grade only — not for production
  const salt = "localpost_salt_v1";
  return crypto
    .scryptSync(password, salt, 64)
    .toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export { hashPassword };

export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const user = await db.user.findUnique({ where: { id: token } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      businessName: user.businessName,
      timezone: user.timezone,
      plan: user.plan as User["plan"],
      role: (user.role as User["role"]) || "owner",
      createdAt: user.createdAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function setSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
