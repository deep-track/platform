"use server";

import { jwtVerify, SignJWT } from "jose";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "./types";

export type Session = {
  user: {
    id: string;
    name: string;
    role: Role;
  };
  accessToken: string;
  refreshToken: string;
};

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(payload: Session) {
  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  // In createSession function, update cookie settings:
(await cookies()).set("session", session, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  expires: expiredAt,
  sameSite: "lax",
  path: "/", // Update this from "/dashboard" to "/"
});
}

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(
      cookie,
      encodedKey,
      {
        algorithms: ["HS256"],
      }
    );

    return payload as Session;
  } catch (err) {
    console.error("Failed to verify the session", err);
    redirect("/login");
  }
}

export async function deleteSession() {
    (await cookies()).delete("session");
}

export async function updateTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;

  const { payload } = await jwtVerify<Session>(
    cookie,
    encodedKey
  );

  if (!payload) throw new Error("Session not found");

  const newPayload: Session = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };

  await createSession(newPayload);
}