# Runbook cutover CMS (belum diotorisasi)

Dokumen ini adalah checklist; menjalankannya pada staging/production memerlukan persetujuan eksplisit yang menyebut target.

## Yang disiapkan manual

- Google OAuth client ID/secret dan callback untuk setiap domain: `/api/auth/callback/google`.
- `BETTER_AUTH_SECRET`, URL aplikasi publik, URL/token database Turso production.
- Token UploadThing, domain delivery yang diizinkan, serta konfirmasi quota bucket.
- Email Google calon super admin yang sudah pernah login; promosi dilakukan manual dengan `bootstrap-super-admin.md`.
- Mapping setiap sponsor lama ke salah satu tier: utama, pendukung, pendamping, pelengkap.
- Lokasi backup repo/bundle, snapshot Turso, target deployment, maintenance window, dan penanggung jawab rollback.

## Sebelum migrasi

1. Review worktree dan commit SHA hardcoded.
2. Buat tag/archive immutable dan checksum di lokasi yang disetujui.
3. Buat serta uji snapshot Turso target.
4. Jalankan `npm run cms:import:2025 -- --dry-run --report .tmp/cms-import-2025.json`.
5. Selesaikan seluruh blocker dalam report, uji permission matrix, dan minta persetujuan visual manusia.

## Cutover dan rollback

Apply migrasi/import hanya setelah target disebutkan dan disetujui. Simpan ID deployment dan snapshot secara privat. Jika smoke test auth, media, public route, atau audit gagal, redeploy artifact hardcoded dan pulihkan snapshot pasangannya; jangan mencoba memperbaiki data production secara ad-hoc.
