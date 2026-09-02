import "dotenv/config";

import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/server/db/schema";
import { seedAuthorizationCatalog } from "@/server/auth/seed";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required");
  const client = createClient({ url, authToken });
  try {
    await seedAuthorizationCatalog(drizzle(client, { schema }));
    console.log("Authorization catalog seeded");
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Authorization catalog seed failed");
  process.exitCode = 1;
});
