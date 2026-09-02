import { and, desc, eq } from "drizzle-orm";

import { AdminPage } from "@/components/admin/primitives";
import { requirePermission } from "@/server/auth/authorization";
import { database } from "@/server/db/client";
import { categories, editions, participants, voteDailyTallies, votingCampaigns } from "@/server/db/schema";

import { VotingWorkspace } from "./voting-workspace";

export default async function VotingAdminPage() {
  const { effectivePermissions } = await requirePermission("voting.view");
  const [editionRows, campaignRows, participantRows, tallyRows] = await Promise.all([
    database.select({ id: editions.id, name: editions.name, year: editions.year }).from(editions).orderBy(desc(editions.year)),
    database.select({ id: votingCampaigns.id, editionId: votingCampaigns.editionId, editionName: editions.name, year: editions.year, name: votingCampaigns.name, status: votingCampaigns.status, pricePerPoint: votingCampaigns.pricePerPoint, startsAt: votingCampaigns.startsAt, endsAt: votingCampaigns.endsAt }).from(votingCampaigns).innerJoin(editions, eq(votingCampaigns.editionId, editions.id)).orderBy(desc(editions.year), desc(votingCampaigns.startsAt)),
    database.select({ id: participants.id, editionId: participants.editionId, name: participants.name, number: participants.number, categoryCode: categories.code, categoryLabel: categories.label, qrisMediaId: participants.qrisMediaId }).from(participants).innerJoin(categories, eq(participants.categoryId, categories.id)).where(and(eq(participants.stage, "finalis"), eq(participants.active, true))).orderBy(categories.displayOrder, participants.displayOrder),
    database.select({ id: voteDailyTallies.id, campaignId: voteDailyTallies.campaignId, participantId: voteDailyTallies.participantId, localDate: voteDailyTallies.localDate, amount: voteDailyTallies.amount, version: voteDailyTallies.version, updatedAt: voteDailyTallies.updatedAt }).from(voteDailyTallies).orderBy(desc(voteDailyTallies.localDate)),
  ]);

  return (
    <AdminPage title="Voting tahunan" description="Kelola kampanye per edisi, QRIS finalis, dan pembaruan tally manual tanpa mencampur peserta antar tahun.">
      <VotingWorkspace
        editions={editionRows}
        campaigns={campaignRows.map((campaign) => ({ ...campaign, startsAt: campaign.startsAt.toISOString(), endsAt: campaign.endsAt.toISOString() }))}
        participants={participantRows.map((participant) => ({ ...participant, qrisReady: Boolean(participant.qrisMediaId) }))}
        tallies={tallyRows.map((tally) => ({ ...tally, updatedAt: tally.updatedAt.toISOString() }))}
        canManage={effectivePermissions.has("voting.manage")}
        canTally={effectivePermissions.has("voting.tally")}
      />
    </AdminPage>
  );
}
