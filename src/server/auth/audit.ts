import { auditLogs } from "@/server/db/schema";
import type { Database } from "@/server/db/queries";

export type AuditInput = {
  actorUserId?: string | null;
  actorLabel: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceLabel?: string | null;
  before?: unknown;
  after?: unknown;
  changedFields?: string[];
  source: string;
  reason?: string | null;
  requestMetadata?: Record<string, string | number | boolean | null>;
};

function serialize(value: unknown, fallback: string | null = null) {
  return value === undefined ? fallback : JSON.stringify(value);
}

type AuditDatabase = Pick<Database, "insert">;

export async function appendAuditLog(db: AuditDatabase, input: AuditInput) {
  await db.insert(auditLogs).values({
    actorUserId: input.actorUserId ?? null,
    actorLabel: input.actorLabel,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    resourceLabel: input.resourceLabel ?? null,
    beforeJson: serialize(input.before),
    afterJson: serialize(input.after),
    changedFieldsJson: serialize(input.changedFields ?? [], "[]")!,
    source: input.source,
    reason: input.reason ?? null,
    requestMetadataJson: serialize(input.requestMetadata ?? {}, "{}")!,
  });
}
