"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Check, QrCode, Search, Vote } from "lucide-react";

import { AdminBadge, AdminButton, AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/primitives";
import { calculateVotesFromAmount } from "@/lib/voting";
import { cn } from "@/lib/utils";

import { createCampaignAction, saveTallyAction } from "./actions";

export type VotingCampaignSummary = {
  id: string;
  editionId: string;
  editionName: string;
  year: number;
  name: string;
  status: string;
  pricePerPoint: number;
  startsAt: string;
  endsAt: string;
};

export type VotingParticipantSummary = {
  id: string;
  editionId: string;
  name: string;
  number: number;
  categoryCode: string;
  categoryLabel: string;
  qrisReady: boolean;
};

export type VotingTallySummary = {
  id: string;
  campaignId: string;
  participantId: string;
  localDate: string;
  amount: number;
  version: number;
  updatedAt: string;
};

type EditionOption = { id: string; name: string; year: number };

const currency = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

function localInputDate(iso: string) {
  const parsed = new Date(iso);
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed).map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function TallyEntryForm({
  campaign,
  participant,
  localDate,
  current,
}: {
  campaign: VotingCampaignSummary;
  participant: VotingParticipantSummary;
  localDate: string;
  current?: VotingTallySummary;
}) {
  const [amount, setAmount] = useState(String(current?.amount ?? 0));
  const numericAmount = Number(amount);
  const votes = Number.isSafeInteger(numericAmount) && numericAmount >= 0 && campaign.pricePerPoint > 0
    ? calculateVotesFromAmount(numericAmount, campaign.pricePerPoint)
    : 0;

  return (
    <form action={saveTallyAction} className="grid gap-4 border-t border-dgb-100 pt-5 sm:grid-cols-2">
      <input type="hidden" name="campaignId" value={campaign.id} />
      <input type="hidden" name="participantId" value={participant.id} />
      <input type="hidden" name="localDate" value={localDate} />
      <input type="hidden" name="version" value={current?.version ?? 0} />
      <AdminField label="Nominal pemasukan tanggal ini" hint="Masukkan total pada merchant app untuk tanggal yang dipilih, bukan selisih dari pembaruan sebelumnya.">
        <AdminInput name="amount" type="number" min="0" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} required />
      </AdminField>
      <div className="border-l-2 border-fb bg-fb-50/55 px-4 py-3">
        <p className="text-xs text-muted-foreground">Vote yang dihitung</p>
        <p className="mt-1 font-montserrat text-2xl font-semibold text-dgb-900">{votes.toLocaleString("id-ID")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{currency.format(campaign.pricePerPoint)} per vote</p>
      </div>
      <AdminField label="Catatan pembaruan" hint="Tuliskan interval laporan atau sumber pengecekan merchant." className="sm:col-span-2">
        <AdminTextarea name="reason" placeholder="Contoh: Rekap merchant pukul 16.00 WIB" required />
      </AdminField>
      <AdminButton type="submit" className="sm:col-span-2"><Check size={16} /> Simpan pembaruan</AdminButton>
    </form>
  );
}

export function VotingWorkspace({
  editions,
  campaigns,
  participants,
  tallies,
  canManage,
  canTally,
}: {
  editions: EditionOption[];
  campaigns: VotingCampaignSummary[];
  participants: VotingParticipantSummary[];
  tallies: VotingTallySummary[];
  canManage: boolean;
  canTally: boolean;
}) {
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id ?? "");
  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? campaigns[0];
  const eligibleParticipants = useMemo(
    () => participants.filter((participant) => participant.editionId === selectedCampaign?.editionId),
    [participants, selectedCampaign?.editionId],
  );
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const selectedParticipant = eligibleParticipants.find((participant) => participant.id === selectedParticipantId) ?? eligibleParticipants[0];
  const [selectedDate, setSelectedDate] = useState(selectedCampaign ? localInputDate(selectedCampaign.startsAt) : "");
  const [query, setQuery] = useState("");

  const campaignTallies = tallies.filter((tally) => tally.campaignId === selectedCampaign?.id);
  const participantTotals = new Map<string, number>();
  for (const tally of campaignTallies) participantTotals.set(tally.participantId, (participantTotals.get(tally.participantId) ?? 0) + tally.amount);
  const totalVotes = selectedCampaign && selectedCampaign.pricePerPoint > 0
    ? [...participantTotals.values()].reduce((sum, amount) => sum + calculateVotesFromAmount(amount, selectedCampaign.pricePerPoint), 0)
    : 0;
  const currentTally = campaignTallies.find((tally) => tally.participantId === selectedParticipant?.id && tally.localDate === selectedDate);
  const standings = eligibleParticipants
    .filter((participant) => participant.name.toLowerCase().includes(query.toLowerCase()))
    .map((participant) => {
      const amount = participantTotals.get(participant.id) ?? 0;
      return { ...participant, amount, votes: selectedCampaign && selectedCampaign.pricePerPoint > 0 ? calculateVotesFromAmount(amount, selectedCampaign.pricePerPoint) : 0 };
    })
    .sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, "id"));
  const categoryOrder = [...new Map(eligibleParticipants.map((participant) => [participant.categoryCode, participant.categoryLabel])).entries()];
  const standingsByCategory = categoryOrder.map(([code, label]) => ({
    code,
    label,
    participants: standings.filter((participant) => participant.categoryCode === code),
  })).filter((group) => group.participants.length > 0);

  function selectCampaign(id: string) {
    const campaign = campaigns.find((item) => item.id === id);
    setSelectedCampaignId(id);
    setSelectedParticipantId("");
    if (campaign) setSelectedDate(localInputDate(campaign.startsAt));
  }

  return (
    <div className="space-y-8">
      {canManage ? (
        <details className="border-y border-dgb-100 bg-white/45">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-1 py-4 marker:content-none">
            <div><h2 className="font-montserrat text-base font-semibold text-dgb-900">Siapkan kampanye tahun baru</h2><p className="mt-1 text-sm text-muted-foreground">Kampanye baru selalu dimulai tanpa membawa tally dari edisi sebelumnya.</p></div>
            <CalendarPlus className="size-5 text-fb-600" />
          </summary>
          <form action={createCampaignAction} className="grid gap-4 border-t border-dgb-100 px-1 py-5 sm:grid-cols-2 xl:grid-cols-3">
            <AdminField label="Edisi"><AdminSelect name="editionId" required><option value="">Pilih edisi</option>{editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.year} · {edition.name}</option>)}</AdminSelect></AdminField>
            <AdminField label="Nama kampanye"><AdminInput name="name" placeholder="Voting Kameumeut 2026" required /></AdminField>
            <AdminField label="Slug"><AdminInput name="slug" placeholder="voting-kameumeut-2026" required /></AdminField>
            <AdminField label="Harga per vote"><AdminInput type="number" min="1" name="pricePerPoint" placeholder="2000" required /></AdminField>
            <AdminField label="Mulai, WIB"><AdminInput type="datetime-local" name="startsAt" required /></AdminField>
            <AdminField label="Selesai, WIB"><AdminInput type="datetime-local" name="endsAt" required /></AdminField>
            <AdminButton type="submit" className="sm:col-span-2 xl:col-span-3"><CalendarPlus size={16} /> Buat kampanye draft</AdminButton>
          </form>
        </details>
      ) : null}

      {selectedCampaign ? (
        <div className="grid gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
          <aside>
            <h2 className="font-montserrat text-sm font-semibold text-dgb-900">Kampanye</h2>
            <div className="mt-3 border-y border-dgb-100">
              {campaigns.map((campaign) => (
                <button key={campaign.id} type="button" onClick={() => selectCampaign(campaign.id)} className={cn("block w-full border-l-2 px-3 py-3 text-left transition-colors", campaign.id === selectedCampaign.id ? "border-fb bg-dgb-50/70" : "border-transparent hover:bg-dgb-50/35")}>
                  <span className="block font-montserrat text-sm font-semibold text-dgb-900">{campaign.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{campaign.year} · {campaign.status}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <header className="flex flex-col gap-4 border-b border-dgb-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm font-medium text-fb-700">{selectedCampaign.year} · {selectedCampaign.editionName}</p><h2 className="mt-1 font-montserrat text-2xl font-semibold text-dgb-900">{selectedCampaign.name}</h2><p className="mt-2 text-sm text-muted-foreground">{date.format(new Date(selectedCampaign.startsAt))} sampai {date.format(new Date(selectedCampaign.endsAt))}</p></div>
              <AdminBadge value={selectedCampaign.status} />
            </header>

            <div className="grid border-b border-dgb-100 sm:grid-cols-3">
              <div className="py-4 sm:border-r sm:border-dgb-100 sm:px-4"><p className="text-xs text-muted-foreground">Finalis edisi ini</p><p className="mt-1 font-montserrat text-2xl font-semibold text-dgb-900">{eligibleParticipants.length}</p></div>
              <div className="py-4 sm:border-r sm:border-dgb-100 sm:px-4"><p className="text-xs text-muted-foreground">QRIS siap</p><p className="mt-1 font-montserrat text-2xl font-semibold text-dgb-900">{eligibleParticipants.filter((participant) => participant.qrisReady).length}<span className="text-sm font-normal text-muted-foreground">/{eligibleParticipants.length}</span></p></div>
              <div className="py-4 sm:px-4"><p className="text-xs text-muted-foreground">Total vote tercatat</p><p className="mt-1 font-montserrat text-2xl font-semibold text-dgb-900">{totalVotes.toLocaleString("id-ID")}</p></div>
            </div>

            {canTally && selectedParticipant ? (
              <section className="py-7">
                <div className="mb-5"><h3 className="font-montserrat text-lg font-semibold text-dgb-900">Perbarui tally manual</h3><p className="mt-1 text-sm text-muted-foreground">Pilih finalis dan tanggal rekap. Nilai pada tanggal yang sama akan diperbarui dengan pemeriksaan versi.</p></div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <AdminField label="Finalis"><AdminSelect value={selectedParticipant.id} onChange={(event) => setSelectedParticipantId(event.target.value)}>{eligibleParticipants.map((participant) => <option key={participant.id} value={participant.id}>{participant.categoryCode} {participant.number} · {participant.name}</option>)}</AdminSelect></AdminField>
                  <AdminField label="Tanggal rekap"><AdminInput type="date" min={localInputDate(selectedCampaign.startsAt)} max={localInputDate(selectedCampaign.endsAt)} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} /></AdminField>
                  <div className="flex items-end"><div className="w-full border-l-2 border-dgb px-3 py-2"><p className="text-xs text-muted-foreground">Tersimpan untuk tanggal ini</p><p className="mt-1 text-sm font-semibold text-dgb-900">{currency.format(currentTally?.amount ?? 0)}</p></div></div>
                </div>
                <TallyEntryForm key={`${selectedCampaign.id}:${selectedParticipant.id}:${selectedDate}:${currentTally?.version ?? 0}`} campaign={selectedCampaign} participant={selectedParticipant} localDate={selectedDate} current={currentTally} />
              </section>
            ) : (
              <div className="border-b border-dashed border-dgb-200 py-10 text-center"><Vote className="mx-auto size-6 text-dgb" /><p className="mt-3 font-montserrat text-sm font-semibold text-dgb-900">Belum ada finalis yang dapat ditally</p><p className="mt-1 text-sm text-muted-foreground">Tambahkan finalis aktif pada edisi {selectedCampaign.year} terlebih dahulu.</p></div>
            )}

            <section className="border-t border-dgb-100 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-montserrat text-lg font-semibold text-dgb-900">Posisi sementara per kategori</h3><p className="mt-1 text-sm text-muted-foreground">Setiap kategori memiliki urutan sendiri berdasarkan akumulasi nominal harian.</p></div><label className="relative block sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><AdminInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari finalis" className="pl-9" /></label></div>
              <div className="mt-4 space-y-7">
                {standingsByCategory.map((group) => (
                  <div key={group.code}>
                    <div className="flex items-end justify-between border-b border-dgb-200 px-2 pb-2"><div><p className="font-montserrat text-base font-semibold text-dgb-900">{group.label}</p><p className="mt-1 text-xs text-muted-foreground">Kategori {group.code}</p></div><span className="text-xs text-muted-foreground">{group.participants.length} finalis</span></div>
                    {group.participants.map((participant, index) => (
                      <div key={participant.id} className="grid gap-3 border-b border-dgb-100 px-2 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto_auto] sm:items-center">
                        <span className="font-montserrat text-sm font-semibold tabular-nums text-fb-700">{String(index + 1).padStart(2, "0")}</span>
                        <div><p className="font-montserrat text-sm font-semibold text-dgb-900">{participant.name}</p><p className="mt-1 text-xs text-muted-foreground">Nomor {participant.number}</p></div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground"><QrCode size={14} className={participant.qrisReady ? "text-dgb" : "text-destructive"} />{participant.qrisReady ? "QRIS siap" : "QRIS belum ada"}</div>
                        <div className="text-left sm:min-w-28 sm:text-right"><p className="font-montserrat text-lg font-semibold text-dgb-900">{participant.votes.toLocaleString("id-ID")}</p><p className="text-xs text-muted-foreground">{currency.format(participant.amount)}</p></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="border-y border-dashed border-dgb-200 py-14 text-center"><Vote className="mx-auto size-7 text-dgb" /><h2 className="mt-4 font-montserrat text-lg font-semibold text-dgb-900">Belum ada kampanye voting</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Buat kampanye untuk edisi baru. Peserta dan tally edisi lama tidak akan ikut terbawa.</p></div>
      )}
    </div>
  );
}
