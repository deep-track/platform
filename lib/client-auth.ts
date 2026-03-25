import { getAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export type ClientSession = {
  userId: string;
  orgId: string;
  role: string;
  orgName: string;
};

export async function getClientSession(): Promise<ClientSession | null> {
  try {
    const auth = await getAuth();
    if (!auth?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { externalId: auth.userId },
      include: {
        clientMemberships: {
          where: { isActive: true },
          include: { org: true },
          take: 1,
        },
      },
    });

    const membership = user?.clientMemberships[0];
    if (!membership) return null;

    return {
      userId: user!.id,
      orgId: membership.orgId,
      role: membership.role,
      orgName: membership.org.name,
    };
  } catch {
    return null;
  }
}

export function requireRoles(
  session: ClientSession | null,
  allowed: string[]
): boolean {
  if (!session) return false;
  return allowed.includes(session.role);
}

// Role constants for easy use
export const ROLES = {
  ALL: [
    "CLIENT_ADMIN",
    "COMPLIANCE_ANALYST",
    "DEVELOPER",
    "VIEWER",
  ] as string[],
  ADMIN_ONLY: ["CLIENT_ADMIN"] as string[],
  CAN_REVIEW: ["CLIENT_ADMIN", "COMPLIANCE_ANALYST"] as string[],
  CAN_DEV: ["CLIENT_ADMIN", "DEVELOPER"] as string[],
};
