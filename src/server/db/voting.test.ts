import assert from "node:assert/strict";
import test from "node:test";

import { calculateVotesFromAmount, formatLocalDate, isParticipantEligibleForCampaign } from "../../lib/voting";

test("jumlah vote diturunkan dari nominal pemasukan dan harga kampanye", () => {
  assert.equal(calculateVotesFromAmount(10_000, 2_000), 5);
  assert.equal(calculateVotesFromAmount(9_999, 2_000), 4);
});

test("nominal atau harga kampanye yang tidak valid ditolak", () => {
  assert.throws(() => calculateVotesFromAmount(-1, 2_000));
  assert.throws(() => calculateVotesFromAmount(2_000, 0));
  assert.throws(() => calculateVotesFromAmount(Number.MAX_SAFE_INTEGER + 1, 2_000));
});

test("kampanye hanya menerima finalis aktif dari edisi yang sama", () => {
  assert.equal(isParticipantEligibleForCampaign("2026", { editionId: "2026", stage: "finalis", active: true }), true);
  assert.equal(isParticipantEligibleForCampaign("2026", { editionId: "2025", stage: "finalis", active: true }), false);
  assert.equal(isParticipantEligibleForCampaign("2026", { editionId: "2026", stage: "semifinalis", active: true }), false);
  assert.equal(isParticipantEligibleForCampaign("2026", { editionId: "2026", stage: "finalis", active: false }), false);
});

test("tanggal lokal kampanye mengikuti zona Asia/Jakarta", () => {
  assert.equal(formatLocalDate(new Date("2026-01-01T00:30:00+07:00"), "Asia/Jakarta"), "2026-01-01");
  assert.equal(formatLocalDate(new Date("2025-12-31T17:30:00Z"), "Asia/Jakarta"), "2026-01-01");
});
