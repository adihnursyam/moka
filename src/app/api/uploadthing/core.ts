import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/server/auth/config";
import { getEffectivePermissions } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { mediaAssets, mediaFolders } from "@/server/db/schema";
import { appendAuditLog } from "@/server/auth/audit";
import { mediaPolicy } from "@/server/media/policy";

const f = createUploadthing();
const folderInput = z.object({ folderId: z.string().uuid().nullable().optional() });
const createRoute = (config: Parameters<typeof f>[0], kind: string) => f(config)
  .input(folderInput)
  .middleware(async ({ req, files, input }) => {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) throw new UploadThingError("Unauthorized");
    const permissions = await getEffectivePermissions(session.user.id);
    if (!permissions.has("media.manage")) throw new UploadThingError("Forbidden");
    if (kind === "image" && files.some((file) => file.size > mediaPolicy.image.applicationMaxBytes)) {
      throw new UploadThingError("Ukuran gambar maksimal 20 MB");
    }
    const folderId = input.folderId ?? null;
    if (folderId) {
      const [folder] = await database.select({ id: mediaFolders.id }).from(mediaFolders).where(eq(mediaFolders.id, folderId)).limit(1);
      if (!folder) throw new UploadThingError("Folder media tidak ditemukan");
    }
    return { userId: session.user.id, email: session.user.email, kind, folderId };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    await database.transaction(async (tx) => {
      await tx.insert(mediaAssets).values({ provider: "uploadthing", providerKey: file.key, url: file.ufsUrl, filename: file.name, mimeType: file.type, bytes: file.size, lifecycle: "ready", folderId: metadata.folderId, ownerUserId: metadata.userId });
      await appendAuditLog(tx, { actorUserId: metadata.userId, actorLabel: metadata.email, action: "media.upload.complete", resourceType: "mediaAsset", resourceId: file.key, resourceLabel: file.name, after: { kind: metadata.kind, bytes: file.size, mimeType: file.type, folderId: metadata.folderId }, changedFields: ["providerKey","url","lifecycle","folderId"], source: "uploadthing-callback" });
    });
    return { key: file.key, url: file.ufsUrl };
  });

export const uploadRouter = {
  image: createRoute({ image: { maxFileSize: mediaPolicy.image.maxFileSize, maxFileCount: mediaPolicy.image.maxFileCount } }, "image"),
  video: createRoute({ video: mediaPolicy.video }, "video"),
  pdf: createRoute({ pdf: mediaPolicy.pdf }, "pdf"),
} satisfies FileRouter;
export type UploadRouter = typeof uploadRouter;
