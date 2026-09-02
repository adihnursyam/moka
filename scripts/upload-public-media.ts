import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@libsql/client/node";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { UTApi, UTFile } from "uploadthing/server";
import * as schema from "@/server/db/schema";

const mime: Record<string, string> = { ".avif":"image/avif", ".gif":"image/gif", ".jpeg":"image/jpeg", ".jpg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml", ".webp":"image/webp", ".mp4":"video/mp4", ".webm":"video/webm", ".mov":"video/quicktime", ".pdf":"application/pdf" };
const stableId = (value: string) => `import-${createHash("sha256").update(value).digest("hex").slice(0, 32)}`;
async function walk(dir: string): Promise<string[]> { const result: string[] = []; for (const entry of await readdir(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) result.push(...await walk(file)); else result.push(file); } return result; }

async function main() {
  const url = process.env.TURSO_DATABASE_URL, authToken = process.env.TURSO_AUTH_TOKEN, token = process.env.UPLOADTHING_TOKEN;
  if (!url || !authToken || !token) throw new Error("Turso/UploadThing env belum lengkap");
  const host = new URL(url).host, confirm = process.argv[process.argv.indexOf("--confirm-host") + 1];
  if (confirm !== host) throw new Error(`Gunakan --confirm-host ${host}`);
  const client = createClient({ url, authToken }), db = drizzle(client, { schema }), utapi = new UTApi({ token });
  try {
    const all = (await walk("public")).filter(file => mime[path.extname(file).toLowerCase()]);
    const remote = new Map<string, { key: string }>();
    for (let offset = 0;; offset += 500) { const listed = await utapi.listFiles({ limit: 500, offset }); for (const file of listed.files) if (file.customId) remote.set(file.customId, { key: file.key }); if (!listed.hasMore) break; }
    let uploaded = 0, skipped = 0, reconciled = 0, failed = 0;
    for (let offset = 0; offset < all.length; offset++) {
      const file = all[offset], relative = "/" + path.relative("public", file).replaceAll("\\", "/");
      if (await db.query.mediaAssets.findFirst({ where: eq(schema.mediaAssets.filename, relative) })) { skipped++; continue; }
      const customId = stableId(relative), remoteFile = remote.get(customId), info = await stat(file);
      if (info.size > 32 * 1024 * 1024) {
        await db.insert(schema.mediaAssets).values({ id: stableId(`media:${relative}`), provider: "local", providerKey: relative, url: relative, filename: relative, mimeType: mime[path.extname(file).toLowerCase()], bytes: info.size, alt: path.basename(relative, path.extname(relative)).replaceAll(/[_-]+/g, " "), lifecycle: "ready" }).onConflictDoNothing();
        reconciled++; console.log(JSON.stringify({ progress: offset + 1, total: all.length, uploaded, skipped, reconciled, failed, file: relative, provider: "local-large-file" })); continue;
      }
      if (remoteFile) {
        const resolvedResponse = await utapi.getFileUrls(remoteFile.key), resolved = resolvedResponse.data[0];
        await db.insert(schema.mediaAssets).values({ id: stableId(`media:${relative}`), provider: "uploadthing", providerKey: remoteFile.key, url: resolved.url, filename: relative, mimeType: mime[path.extname(file).toLowerCase()], bytes: info.size, alt: path.basename(relative, path.extname(relative)).replaceAll(/[_-]+/g, " "), lifecycle: "ready" }).onConflictDoNothing();
        reconciled++; console.log(JSON.stringify({ progress: offset + 1, total: all.length, uploaded, skipped, reconciled, failed, file: relative })); continue;
      }
      console.log(JSON.stringify({ uploading: relative, progress: offset + 1, total: all.length }));
      const uploadFile = new UTFile([await readFile(file)], relative.slice(1).replaceAll("/", "__"), { type: mime[path.extname(file).toLowerCase()], customId });
      const result = await utapi.uploadFiles(uploadFile, { signal: AbortSignal.timeout(600_000) });
      if (result.error || !result.data) { failed++; console.error(`UPLOAD_FAILED ${relative} ${result.error?.message ?? "unknown"}`); continue; }
      await db.insert(schema.mediaAssets).values({ id: stableId(`media:${relative}`), provider: "uploadthing", providerKey: result.data.key, url: result.data.ufsUrl, filename: relative, mimeType: mime[path.extname(file).toLowerCase()], bytes: info.size, alt: path.basename(relative, path.extname(relative)).replaceAll(/[_-]+/g, " "), lifecycle: "ready" }).onConflictDoNothing();
      uploaded++; console.log(JSON.stringify({ progress: offset + 1, total: all.length, uploaded, skipped, reconciled, failed, file: relative }));
    }
    if (failed) throw new Error(`${failed} media gagal diunggah`);
    await db.insert(schema.auditLogs).values({ id: stableId("audit:media-import:2025:v1"), actorLabel: "system:cms-import", action: "media.import.complete", resourceType: "mediaLibrary", resourceId: "public-2025", resourceLabel: "Public media 2025", afterJson: JSON.stringify({ total: all.length, uploaded, skipped, reconciled }), changedFieldsJson: JSON.stringify(["assets"]), source: "production-import", reason: "Operator authorized UploadThing production import on 2026-07-30" }).onConflictDoNothing();
    console.log(JSON.stringify({ complete: true, total: all.length, uploaded, skipped, reconciled }, null, 2));
  } finally { client.close(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Upload gagal"); process.exitCode = 1; });
