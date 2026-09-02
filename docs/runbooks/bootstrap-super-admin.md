# Bootstrap super admin manually in Turso

Run this only after migration `0001_robust_tag.sql` is applied, the authorization
catalog has been seeded, and the intended Google account has completed its first
sign-in. Replace `:verified_email` in the Turso Cloud SQL editor; do not put an
email in source control or an environment variable.

Preflight must return exactly one pending user and exactly one `super_admin` role:

```sql
SELECT u.id, u.email, p.status
FROM user u JOIN adminProfile p ON p.userId = u.id
WHERE lower(u.email) = lower(':verified_email') AND u.emailVerified = 1;

SELECT id, slug FROM role WHERE slug = 'super_admin';
```

If either result is not exactly one row, stop. Then run the following transaction
with the exact IDs from preflight:

```sql
BEGIN IMMEDIATE;
UPDATE adminProfile
SET status = 'active', statusReason = 'manual Turso bootstrap', updatedAt = unixepoch() * 1000
WHERE userId = ':user_id' AND status = 'pending';

INSERT INTO userRole (userId, roleId, grantedAt)
VALUES (':user_id', ':super_admin_role_id', unixepoch() * 1000);

INSERT INTO auditLog (
  id, actorUserId, actorLabel, action, resourceType, resourceId, resourceLabel,
  beforeJson, afterJson, changedFieldsJson, source, reason, requestMetadataJson, createdAt
) VALUES (
  lower(hex(randomblob(16))), NULL, 'manual-turso-bootstrap', 'access.bootstrap',
  'adminProfile', ':user_id', ':verified_email', '{"status":"pending"}',
  '{"status":"active","role":"super_admin"}', '["status","role"]',
  'manual-turso-bootstrap', 'Initial super admin promotion', '{}', unixepoch() * 1000
);
COMMIT;
```

Postflight: sign out/in, then confirm one active profile, one `super_admin` role,
and one `access.bootstrap` audit row. If any write count is zero or unexpected,
run `ROLLBACK` and investigate before retrying.
