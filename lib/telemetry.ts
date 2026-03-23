import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";

type ActorType =
  | "applicant"
  | "analyst"
  | "client_admin"
  | "client_developer"
  | "system";

interface TrackEventParams {
  eventType: string;
  orgId: string;
  actorType: ActorType;
  actorId?: string;
  sessionId?: string;
  source: string;
  verificationId?: string;
  properties?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

// Non-blocking fire-and-forget telemetry
// Never throws — telemetry must never block the main flow
export function trackEvent(params: TrackEventParams): void {
  prisma.telemetryEvent
    .create({
      data: {
        eventId: randomUUID(),
        eventType: params.eventType,
        orgId: params.orgId,
        actorType: params.actorType,
        actorId: params.actorId,
        sessionId: params.sessionId,
        source: params.source,
        traceId: randomUUID(),
        verificationId: params.verificationId,
        properties: params.properties ?? {},
        context: params.context ?? {},
        environment: process.env.NODE_ENV ?? "production",
      },
    })
    .catch((err) => {
      console.error("[telemetry] Failed to track event:", err);
    });
}

interface AuditLogParams {
  orgId: string;
  eventType: string;
  actorId?: string;
  actorRole?: string;
  targetType?: string;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Write to immutable audit log
export function auditLog(params: AuditLogParams): void {
  prisma.auditLog
    .create({
      data: {
        logId: randomUUID(),
        orgId: params.orgId,
        eventType: params.eventType,
        actorId: params.actorId,
        actorRole: params.actorRole,
        targetType: params.targetType,
        targetId: params.targetId,
        before: params.before,
        after: params.after,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
    .catch((err) => {
      console.error("[audit] Failed to write audit log:", err);
    });
}
