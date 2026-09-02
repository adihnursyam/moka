import { index, integer, primaryKey, sqliteTable, text, uniqueIndex, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

export const categoryValues = ['JD', 'MD', 'JR', 'MR'] as const;
export type Category = (typeof categoryValues)[number];

export function parseCategory(value: string): Category {
  if (!categoryValues.includes(value as Category)) {
    throw new Error(`Invalid category: ${value}`);
  }
  return value as Category;
}

export function validateIncome(value: number) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < -2_147_483_648 || value > 2_147_483_647) {
    throw new Error('Income must be a finite 32-bit integer');
  }
  return value;
}

const timestamps = {
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
};

export const semifinalists = sqliteTable('Semifinalist', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  category: text('category', { enum: categoryValues }).notNull(),
  ...timestamps,
});

export const finalists = sqliteTable('Finalist', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  category: text('category', { enum: categoryValues }).notNull(),
  ...timestamps,
});

export const incomePerDate = sqliteTable('IncomePerDate', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: integer('date', { mode: 'timestamp_ms' }).notNull(),
  semifinalistId: text('semifinalistId').references(() => semifinalists.id),
  finalistId: text('finalistId').references(() => finalists.id),
  income: integer('income').notNull(),
  ...timestamps,
});

const authTimestamps = {
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
};

export const authUsers = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  ...authTimestamps,
});

export const authSessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  ...authTimestamps,
}, (table) => [index('session_user_idx').on(table.userId)]);

export const authAccounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp_ms' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp_ms' }),
  scope: text('scope'),
  password: text('password'),
  ...authTimestamps,
}, (table) => [uniqueIndex('account_provider_account_unique').on(table.providerId, table.accountId), index('account_user_idx').on(table.userId)]);

export const authVerifications = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp_ms' }).notNull(),
  ...authTimestamps,
}, (table) => [index('verification_identifier_idx').on(table.identifier)]);

export const adminProfileStatuses = ['pending', 'active', 'rejected', 'suspended'] as const;
export const overrideEffects = ['allow', 'deny'] as const;
export const accessRequestStatuses = ['open', 'approved', 'rejected', 'cancelled'] as const;

export const adminProfiles = sqliteTable('adminProfile', {
  userId: text('userId').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  status: text('status', { enum: adminProfileStatuses }).notNull().default('pending'),
  statusReason: text('statusReason'),
  requestedAt: integer('requestedAt', { mode: 'timestamp_ms' }),
  lastSignedInAt: integer('lastSignedInAt', { mode: 'timestamp_ms' }),
  ...authTimestamps,
});

export const roles = sqliteTable('role', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
  description: text('description').notNull(),
  isSystem: integer('isSystem', { mode: 'boolean' }).notNull().default(true),
  ...authTimestamps,
});

export const permissions = sqliteTable('permission', {
  key: text('key').primaryKey(),
  label: text('label').notNull(),
  description: text('description').notNull(),
  ...authTimestamps,
});

export const rolePermissions = sqliteTable('rolePermission', {
  roleId: text('roleId').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionKey: text('permissionKey').notNull().references(() => permissions.key, { onDelete: 'restrict' }),
  ...authTimestamps,
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionKey] })]);

export const userRoles = sqliteTable('userRole', {
  userId: text('userId').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  roleId: text('roleId').notNull().references(() => roles.id, { onDelete: 'restrict' }),
  grantedByUserId: text('grantedByUserId').references(() => authUsers.id, { onDelete: 'set null' }),
  grantedAt: integer('grantedAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, (table) => [primaryKey({ columns: [table.userId, table.roleId] }), index('user_role_role_idx').on(table.roleId)]);

export const userPermissionOverrides = sqliteTable('userPermissionOverride', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  permissionKey: text('permissionKey').notNull().references(() => permissions.key, { onDelete: 'restrict' }),
  effect: text('effect', { enum: overrideEffects }).notNull(),
  reason: text('reason').notNull(),
  grantedByUserId: text('grantedByUserId').references(() => authUsers.id, { onDelete: 'set null' }),
  ...authTimestamps,
}, (table) => [uniqueIndex('user_permission_override_unique').on(table.userId, table.permissionKey)]);

export const accessRequests = sqliteTable('accessRequest', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  status: text('status', { enum: accessRequestStatuses }).notNull().default('open'),
  reason: text('reason').notNull(),
  requestedAreasJson: text('requestedAreasJson').notNull().default('[]'),
  reviewedByUserId: text('reviewedByUserId').references(() => authUsers.id, { onDelete: 'set null' }),
  reviewNote: text('reviewNote'),
  reviewedAt: integer('reviewedAt', { mode: 'timestamp_ms' }),
  ...authTimestamps,
}, (table) => [index('access_request_user_idx').on(table.userId), index('access_request_status_idx').on(table.status)]);

export const auditLogs = sqliteTable('auditLog', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorUserId: text('actorUserId').references(() => authUsers.id, { onDelete: 'set null' }),
  actorLabel: text('actorLabel').notNull(),
  action: text('action').notNull(),
  resourceType: text('resourceType').notNull(),
  resourceId: text('resourceId').notNull(),
  resourceLabel: text('resourceLabel'),
  beforeJson: text('beforeJson'),
  afterJson: text('afterJson'),
  changedFieldsJson: text('changedFieldsJson').notNull().default('[]'),
  source: text('source').notNull(),
  reason: text('reason'),
  requestMetadataJson: text('requestMetadataJson').notNull().default('{}'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull().$defaultFn(() => new Date()),
}, (table) => [index('audit_log_created_idx').on(table.createdAt), index('audit_log_resource_idx').on(table.resourceType, table.resourceId)]);

export const editions = sqliteTable('edition', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  year: integer('year').notNull().unique(), slug: text('slug').notNull().unique(), name: text('name').notNull(),
  timezone: text('timezone').notNull().default('Asia/Jakarta'), lifecycle: text('lifecycle').notNull().default('draft'),
  startsAt: integer('startsAt', { mode: 'timestamp_ms' }), endsAt: integer('endsAt', { mode: 'timestamp_ms' }), ...authTimestamps,
});
export const mediaFolders = sqliteTable('mediaFolder', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  parentId: text('parentId').references((): AnySQLiteColumn => mediaFolders.id, { onDelete: 'restrict' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  ownerUserId: text('ownerUserId').references(() => authUsers.id, { onDelete: 'set null' }),
  ...authTimestamps,
}, (t) => [
  uniqueIndex('media_folder_parent_slug_unique').on(t.parentId, t.slug),
  index('media_folder_parent_idx').on(t.parentId),
]);
export const mediaAssets = sqliteTable('mediaAsset', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), provider: text('provider').notNull(), providerKey: text('providerKey'), url: text('url').notNull(),
  filename: text('filename').notNull(), mimeType: text('mimeType').notNull(), bytes: integer('bytes').notNull(), alt: text('alt'), decorative: integer('decorative',{mode:'boolean'}).notNull().default(false), lifecycle: text('lifecycle').notNull().default('ready'), folderId: text('folderId').references(() => mediaFolders.id, { onDelete: 'set null' }), ownerUserId: text('ownerUserId').references(() => authUsers.id), ...authTimestamps,
}, (t) => [uniqueIndex('media_provider_key_unique').on(t.provider, t.providerKey), index('media_asset_folder_idx').on(t.folderId)]);
export const pageSections = sqliteTable('pageSection', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').references(() => editions.id), pageKey: text('pageKey').notNull(), sectionKey: text('sectionKey').notNull(), title: text('title'), eyebrow: text('eyebrow'), body: text('body'), presentationJson: text('presentationJson').notNull().default('{}'), status: text('status').notNull().default('draft'), version: integer('version').notNull().default(1), ...authTimestamps,
}, (t) => [uniqueIndex('page_section_unique').on(t.editionId,t.pageKey,t.sectionKey)]);
export const contentDrafts = sqliteTable('contentDraft', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), resourceType: text('resourceType').notNull(), resourceId: text('resourceId').notNull(), baseVersion: integer('baseVersion').notNull(), snapshotJson: text('snapshotJson').notNull(), authorUserId: text('authorUserId').notNull().references(() => authUsers.id), ...authTimestamps,
}, (t) => [uniqueIndex('content_draft_resource_unique').on(t.resourceType,t.resourceId)]);
export const contentRevisions = sqliteTable('contentRevision', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), resourceType: text('resourceType').notNull(), resourceId: text('resourceId').notNull(), version: integer('version').notNull(), snapshotJson: text('snapshotJson').notNull(), authorUserId: text('authorUserId').references(() => authUsers.id), reason: text('reason'), createdAt: integer('createdAt',{mode:'timestamp_ms'}).notNull().$defaultFn(() => new Date()),
}, (t) => [uniqueIndex('content_revision_unique').on(t.resourceType,t.resourceId,t.version)]);
export const newsArticles = sqliteTable('newsArticle', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').references(() => editions.id), title: text('title').notNull(), slug: text('slug').notNull().unique(), excerpt: text('excerpt'), body: text('body'), kind: text('kind').notNull().default('internal'), sourceUrl: text('sourceUrl'), coverMediaId: text('coverMediaId').references(() => mediaAssets.id), publishedAt: integer('publishedAt',{mode:'timestamp_ms'}), status: text('status').notNull().default('draft'), version: integer('version').notNull().default(1), ...authTimestamps,
});
export const sponsors = sqliteTable('sponsor', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').notNull().references(() => editions.id), name: text('name').notNull(), tier: text('tier',{enum:['utama','pendukung','pendamping','pelengkap'] as const}).notNull(), website: text('website'), logoMediaId: text('logoMediaId').references(() => mediaAssets.id), displayOrder: integer('displayOrder').notNull().default(0), active: integer('active',{mode:'boolean'}).notNull().default(true), version: integer('version').notNull().default(1), ...authTimestamps,
});
export const people = sqliteTable('person', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), name: text('name').notNull(), slug: text('slug').notNull().unique(), shortBio: text('shortBio'), portraitMediaId: text('portraitMediaId').references(() => mediaAssets.id), version: integer('version').notNull().default(1), ...authTimestamps,
});
export const organizationAssignments = sqliteTable('organizationAssignment', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').references(() => editions.id), personId: text('personId').notNull().references(() => people.id), title: text('title').notNull(), group: text('group').notNull(), termLabel: text('termLabel'), displayOrder: integer('displayOrder').notNull().default(0), active: integer('active',{mode:'boolean'}).notNull().default(true), ...authTimestamps,
});
export const categories = sqliteTable('category', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').notNull().references(() => editions.id), code: text('code').notNull(), slug: text('slug').notNull(), label: text('label').notNull(), displayOrder: integer('displayOrder').notNull().default(0), active: integer('active',{mode:'boolean'}).notNull().default(true), ...authTimestamps,
}, (t) => [uniqueIndex('category_edition_code_unique').on(t.editionId,t.code), uniqueIndex('category_edition_slug_unique').on(t.editionId,t.slug)]);
export const participants = sqliteTable('participant', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').notNull().references(() => editions.id), categoryId: text('categoryId').notNull().references(() => categories.id), stage: text('stage').notNull(), number: integer('number').notNull(), name: text('name').notNull(), slug: text('slug').notNull(), bio: text('bio'), portraitMediaId: text('portraitMediaId').references(() => mediaAssets.id), qrisMediaId: text('qrisMediaId').references(() => mediaAssets.id), paymentUrl: text('paymentUrl'), displayOrder: integer('displayOrder').notNull().default(0), active: integer('active',{mode:'boolean'}).notNull().default(true), version: integer('version').notNull().default(1), ...authTimestamps,
}, (t) => [uniqueIndex('participant_edition_stage_slug_unique').on(t.editionId,t.stage,t.slug)]);
export const participantAchievements = sqliteTable('participantAchievement', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), participantId: text('participantId').notNull().references(() => participants.id,{onDelete:'cascade'}), text: text('text').notNull(), displayOrder: integer('displayOrder').notNull().default(0), ...authTimestamps,
});
export const events = sqliteTable('event', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').notNull().references(() => editions.id), slug: text('slug').notNull(), label: text('label').notNull(), description: text('description'), heroMediaId: text('heroMediaId').references(() => mediaAssets.id), displayOrder: integer('displayOrder').notNull().default(0), active: integer('active',{mode:'boolean'}).notNull().default(true), version: integer('version').notNull().default(1), ...authTimestamps,
}, (t) => [uniqueIndex('event_edition_slug_unique').on(t.editionId,t.slug)]);
export const galleries = sqliteTable('gallery', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').references(() => editions.id), ownerType: text('ownerType').notNull(), ownerId: text('ownerId').notNull(), title: text('title').notNull(), version: integer('version').notNull().default(1), ...authTimestamps,
});
export const galleryItems = sqliteTable('galleryItem', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), galleryId: text('galleryId').notNull().references(() => galleries.id,{onDelete:'cascade'}), mediaId: text('mediaId').references(() => mediaAssets.id), youtubeId: text('youtubeId'), caption: text('caption'), displayOrder: integer('displayOrder').notNull().default(0), active: integer('active',{mode:'boolean'}).notNull().default(true), ...authTimestamps,
});
export const votingCampaigns = sqliteTable('votingCampaign', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), editionId: text('editionId').notNull().references(() => editions.id), name: text('name').notNull(), slug: text('slug').notNull().unique(), timezone: text('timezone').notNull().default('Asia/Jakarta'), startsAt: integer('startsAt',{mode:'timestamp_ms'}).notNull(), endsAt: integer('endsAt',{mode:'timestamp_ms'}).notNull(), status: text('status').notNull().default('draft'), pricePerPoint: integer('pricePerPoint').notNull().default(0), resultVisibility: text('resultVisibility').notNull().default('hidden'), version: integer('version').notNull().default(1), ...authTimestamps,
});
export const voteDailyTallies = sqliteTable('voteDailyTally', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), campaignId: text('campaignId').notNull().references(() => votingCampaigns.id), participantId: text('participantId').notNull().references(() => participants.id), localDate: text('localDate').notNull(), amount: integer('amount').notNull().default(0), version: integer('version').notNull().default(1), ...authTimestamps,
}, (t) => [uniqueIndex('vote_tally_unique').on(t.campaignId,t.participantId,t.localDate)]);

export type SemifinalistRow = typeof semifinalists.$inferSelect;
export type FinalistRow = typeof finalists.$inferSelect;
export type IncomePerDateRow = typeof incomePerDate.$inferSelect;
export type FinalistWithIncome = FinalistRow & { votePerDate: IncomePerDateRow[] };
export type SemifinalistWithIncome = SemifinalistRow & { votePerDate: IncomePerDateRow[] };
