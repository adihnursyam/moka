import "dotenv/config";

import { createClient } from "@libsql/client/node";
import { randomUUID } from "node:crypto";

const ROLE_SLUG = "super_admin";
const AUDIT_SOURCE = "manual-turso-bootstrap";

type Row = Record<string, unknown>;

function readTargetEmail() {
  const emailFlagIndex = process.argv.indexOf("--email");
  const email = emailFlagIndex >= 0 ? process.argv[emailFlagIndex + 1] : undefined;
  if (!email || email.startsWith("--") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Usage: npm.cmd run auth:bootstrap-super-admin -- --email verified@example.com");
  }
  return email.trim().toLowerCase();
}

function asString(value: unknown, field: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Unexpected empty ${field} returned by Turso`);
  }
  return value;
}

async function main() {
  const targetEmail = readTargetEmail();
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required");
  }
  const isFile = /^file:/i.test(databaseUrl);
  const targetHost = isFile ? databaseUrl : new URL(databaseUrl).host;

  const client = createClient({ url: databaseUrl, authToken });
  let transaction: Awaited<ReturnType<typeof client.transaction>> | undefined;

  try {
    transaction = await client.transaction("write");

    const now = Date.now();
    const userResult = await transaction.execute({
      sql: `
        SELECT
          u.id AS user_id,
          u.email AS email,
          u.emailVerified AS email_verified,
          p.status AS profile_status
        FROM "user" AS u
        INNER JOIN "adminProfile" AS p ON p.userId = u.id
        WHERE lower(u.email) = lower(?)
      `,
      args: [targetEmail],
    });

    let userId: string;
    let email: string = targetEmail;
    let profileStatus: string = "pending";
    const changedFields: string[] = [];

    if (userResult.rows.length === 0) {
      userId = randomUUID();
      await transaction.execute({
        sql: `
          INSERT INTO "user" (id, name, email, emailVerified, createdAt, updatedAt)
          VALUES (?, ?, ?, 1, ?, ?)
        `,
        args: [userId, targetEmail.split("@")[0], targetEmail, now, now],
      });
      await transaction.execute({
        sql: `
          INSERT INTO "adminProfile" (userId, status, statusReason, requestedAt, createdAt, updatedAt)
          VALUES (?, 'pending', 'manual bootstrap', ?, ?, ?)
        `,
        args: [userId, now, now, now],
      });
      changedFields.push("user", "adminProfile");
    } else {
      const user = userResult.rows[0] as Row;
      userId = asString(user.user_id, "user id");
      email = asString(user.email, "user email");
      profileStatus = asString(user.profile_status, "admin profile status");

      if (Number(user.email_verified) !== 1) {
        throw new Error(`Refusing to promote ${email}: the Google email is not verified`);
      }
      if (profileStatus !== "pending" && profileStatus !== "active") {
        throw new Error(`Refusing to promote ${email}: admin profile status is ${profileStatus}`);
      }
    }

    const roleResult = await transaction.execute({
      sql: `SELECT id, slug FROM "role" WHERE slug = ?`,
      args: [ROLE_SLUG],
    });
    if (roleResult.rows.length !== 1) {
      throw new Error(`Expected exactly one ${ROLE_SLUG} role; found ${roleResult.rows.length}`);
    }
    const role = roleResult.rows[0] as Row;
    const roleId = asString(role.id, "role id");

    const assignmentResult = await transaction.execute({
      sql: `
        SELECT 1
        FROM "userRole"
        WHERE userId = ? AND roleId = ?
        LIMIT 1
      `,
      args: [userId, roleId],
    });
    const alreadySuperAdmin = assignmentResult.rows.length === 1;

    if (profileStatus === "pending") {
      await transaction.execute({
        sql: `
          UPDATE "adminProfile"
          SET status = 'active',
              statusReason = ?,
              updatedAt = ?
          WHERE userId = ? AND status = 'pending'
        `,
        args: ["manual Turso bootstrap", now, userId],
      });
      changedFields.push("status");
    }

    if (!alreadySuperAdmin) {
      await transaction.execute({
        sql: `
          INSERT INTO "userRole" (userId, roleId, grantedByUserId, grantedAt)
          VALUES (?, ?, NULL, ?)
        `,
        args: [userId, roleId, now],
      });
      changedFields.push("role");
    }

    let auditId: string | null = null;
    if (changedFields.length > 0) {
      auditId = randomUUID();
      await transaction.execute({
        sql: `
          INSERT INTO "auditLog" (
            id, actorUserId, actorLabel, action, resourceType, resourceId, resourceLabel,
            beforeJson, afterJson, changedFieldsJson, source, reason, requestMetadataJson, createdAt
          ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          auditId,
          AUDIT_SOURCE,
          "access.bootstrap",
          "adminProfile",
          userId,
          email,
          JSON.stringify({ status: profileStatus, role: alreadySuperAdmin ? ROLE_SLUG : null }),
          JSON.stringify({ status: "active", role: ROLE_SLUG }),
          JSON.stringify(changedFields),
          AUDIT_SOURCE,
          "Manual super admin promotion",
          "{}",
          now,
        ],
      });
    }

    await transaction.commit();
    transaction = undefined;

    const verification = await client.execute({
      sql: `
        SELECT u.email, p.status, r.slug
        FROM "user" AS u
        INNER JOIN "adminProfile" AS p ON p.userId = u.id
        INNER JOIN "userRole" AS ur ON ur.userId = u.id
        INNER JOIN "role" AS r ON r.id = ur.roleId
        WHERE u.id = ? AND r.slug = ?
      `,
      args: [userId, ROLE_SLUG],
    });

    if (verification.rows.length !== 1 || (verification.rows[0] as Row).status !== "active") {
      throw new Error("Postflight verification failed: the account is not active with super_admin role");
    }

    console.log(JSON.stringify({
      target: targetHost,
      email,
      userId,
      role: ROLE_SLUG,
      status: "active",
      changed: changedFields.length > 0,
      changedFields,
      auditId,
    }, null, 2));
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Super admin bootstrap failed");
  process.exitCode = 1;
});
