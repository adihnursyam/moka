"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatLocalDate, isParticipantEligibleForCampaign } from "@/lib/voting";
import { requirePermission } from "@/server/auth/authorization";
import { appendAuditLog } from "@/server/auth/audit";
import { database } from "@/server/db/client";
import { participants, voteDailyTallies, votingCampaigns } from "@/server/db/schema";

function parseWibDateTime(value: FormDataEntryValue | null) {
  const raw = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return new Date(Number.NaN);
  return new Date(`${raw}:00+07:00`);
}

export async function createCampaignAction(formData: FormData) {
  const actor = await requirePermission("voting.manage");
  const editionId = String(formData.get("editionId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const startsAt = parseWibDateTime(formData.get("startsAt"));
  const endsAt = parseWibDateTime(formData.get("endsAt"));
  const pricePerPoint = Number(formData.get("pricePerPoint"));
  if (!editionId || !name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || Number.isNaN(startsAt.valueOf()) || Number.isNaN(endsAt.valueOf()) || startsAt >= endsAt || !Number.isSafeInteger(pricePerPoint) || pricePerPoint <= 0) throw new Error("Kampanye voting tidak valid");
  const id = crypto.randomUUID();
  await database.transaction(async (tx) => {
    await tx.insert(votingCampaigns).values({ id, editionId, name, slug, startsAt, endsAt, pricePerPoint });
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: "voting.campaign.create", resourceType: "votingCampaign", resourceId: id, resourceLabel: name, after: { editionId, name, slug, startsAt, endsAt, pricePerPoint }, changedFields: ["editionId", "name", "slug", "startsAt", "endsAt", "pricePerPoint"], source: "admin-voting" });
  });
  revalidatePath("/admin/voting");
}

export async function saveTallyAction(formData: FormData) {
  const actor = await requirePermission("voting.tally");
  const campaignId = String(formData.get("campaignId") ?? "");
  const participantId = String(formData.get("participantId") ?? "");
  const localDate = String(formData.get("localDate") ?? "");
  const amount = Number(formData.get("amount"));
  const expectedVersion = Number(formData.get("version") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim();
  if (!campaignId || !participantId || !/^\d{4}-\d{2}-\d{2}$/.test(localDate) || !Number.isSafeInteger(amount) || amount < 0 || !Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || !reason) throw new Error("Tally dan alasan perubahan wajib valid");
  await database.transaction(async (tx) => {
    const [campaign] = await tx.select().from(votingCampaigns).where(eq(votingCampaigns.id, campaignId)).limit(1);
    const [participant] = await tx.select().from(participants).where(eq(participants.id, participantId)).limit(1);
    if (!campaign || !participant || !isParticipantEligibleForCampaign(campaign.editionId, participant)) {
      throw new Error("Peserta bukan finalis aktif pada edisi kampanye ini");
    }
    const firstDate = formatLocalDate(campaign.startsAt, campaign.timezone);
    const lastDate = formatLocalDate(campaign.endsAt, campaign.timezone);
    if (localDate < firstDate || localDate > lastDate) {
      throw new Error("Tanggal tally berada di luar periode kampanye");
    }
    const [before] = await tx.select().from(voteDailyTallies).where(and(eq(voteDailyTallies.campaignId, campaignId), eq(voteDailyTallies.participantId, participantId), eq(voteDailyTallies.localDate, localDate))).limit(1);
    if ((before?.version ?? 0) !== expectedVersion) {
      throw new Error("Tally telah diperbarui admin lain. Muat ulang halaman sebelum menyimpan.");
    }
    const id = before?.id ?? crypto.randomUUID();
    await tx.insert(voteDailyTallies).values({ id, campaignId, participantId, localDate, amount }).onConflictDoUpdate({ target: [voteDailyTallies.campaignId, voteDailyTallies.participantId, voteDailyTallies.localDate], set: { amount, version: (before?.version ?? 0) + 1, updatedAt: new Date() } });
    await appendAuditLog(tx, { actorUserId: actor.session.user.id, actorLabel: actor.session.user.email, action: before ? "voting.tally.correct" : "voting.tally.create", resourceType: "voteDailyTally", resourceId: id, resourceLabel: participant.name, before: before ? { amount: before.amount, version: before.version } : null, after: { campaignId, participantId, localDate, amount, version: (before?.version ?? 0) + 1 }, changedFields: ["amount", "version"], source: "admin-voting", reason });
  });
  revalidatePath("/admin/voting");
}
