import { and, asc, desc, eq, gte, inArray, lte } from 'drizzle-orm';
import { connection } from 'next/server';
import { cache } from 'react';
import { parseCategory, categories as dbCategories, editions, events, galleries, galleryItems, mediaAssets, newsArticles, organizationAssignments, pageSections, participantAchievements, participants, people, sponsors as dbSponsors, votingCampaigns } from '@/server/db/schema';
import { database } from '@/server/db/client';
import { getFinalistsWithIncome } from '@/server/db/queries';

export type PublicParticipant = {
  id: string;
  number: number;
  name: string;
  slug: string;
  bio: string;
  imageUrl: string;
  paymentUrl: string | null;
  achievements: string[];
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  abrev: ReturnType<typeof parseCategory>;
  list: PublicParticipant[];
  finalist: PublicParticipant[];
};

export type PublicEvent = {
  slug: string;
  label: string;
  desc: string;
  images: string[];
};

export type PublicSponsor = {
  name: string;
  src: string;
};

export type PublicNewsItem = {
  title: string;
  description: string;
  imageUrl: string | null;
  date: Date;
  link: string;
  type: 'file' | 'link';
};

type PublicPerson = {
  imageUrl: string | null;
  name: string;
  position: string;
  gender?: 'L' | 'P';
};

export type PublicAboutContent = {
  mission: string[];
  pengurus: PublicPerson[];
  ketua: PublicPerson[];
  youtubeIds: string[];
};

export type PublicVotingCampaign = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  pricePerPoint: number;
  resultVisibility: string;
};

export type PublicEdition = {
  id: string;
  year: number;
  slug: string;
  name: string;
  lifecycle: string;
};

export const getCurrentEdition = cache(async (): Promise<PublicEdition> => {
  await connection();

  const [activeEdition] = await database
    .select({ id: editions.id, year: editions.year, slug: editions.slug, name: editions.name, lifecycle: editions.lifecycle })
    .from(editions)
    .where(eq(editions.lifecycle, 'active'))
    .orderBy(desc(editions.year))
    .limit(1);

  if (activeEdition) return activeEdition;

  const [edition] = await database
    .select({ id: editions.id, year: editions.year, slug: editions.slug, name: editions.name, lifecycle: editions.lifecycle })
    .from(editions)
    .orderBy(desc(editions.year))
    .limit(1);

  if (!edition) {
    throw new Error('No Turso edition is configured');
  }

  return edition;
});

async function getCurrentEditionId() {
  return (await getCurrentEdition()).id;
}

function toRemoteUrl(url: string | null | undefined) {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

async function getPublicParticipants(editionId: string) {
  const rows = await database
    .select({
      participant: participants,
      categoryCode: dbCategories.code,
      categorySlug: dbCategories.slug,
      categoryName: dbCategories.label,
      categoryOrder: dbCategories.displayOrder,
      imageUrl: mediaAssets.url,
    })
    .from(participants)
    .innerJoin(dbCategories, eq(participants.categoryId, dbCategories.id))
    .leftJoin(mediaAssets, eq(participants.portraitMediaId, mediaAssets.id))
    .where(
      and(
        eq(participants.editionId, editionId),
        eq(participants.active, true),
        eq(dbCategories.active, true),
        inArray(participants.stage, ['semifinalis', 'finalis']),
      ),
    )
    .orderBy(
      asc(dbCategories.displayOrder),
      asc(participants.stage),
      asc(participants.displayOrder),
      asc(participants.number),
      asc(participants.name),
    );

  const participantIds = rows.map(({ participant }) => participant.id);
  const achievementRows = participantIds.length
    ? await database
      .select({
        participantId: participantAchievements.participantId,
        text: participantAchievements.text,
      })
      .from(participantAchievements)
      .where(inArray(participantAchievements.participantId, participantIds))
      .orderBy(asc(participantAchievements.displayOrder), asc(participantAchievements.text))
    : [];

  const achievementsByParticipant = new Map<string, string[]>();
  for (const achievement of achievementRows) {
    const current = achievementsByParticipant.get(achievement.participantId) ?? [];
    current.push(achievement.text);
    achievementsByParticipant.set(achievement.participantId, current);
  }

  return rows.map(({ participant, categoryCode, categorySlug, categoryName, categoryOrder, imageUrl }) => {
    const remoteImageUrl = toRemoteUrl(imageUrl);
    if (!remoteImageUrl) {
      throw new Error(`Turso participant ${participant.id} has no remote portrait`);
    }

    return {
      participant: {
        id: participant.id,
        number: participant.number,
        name: participant.name,
        slug: participant.slug,
        bio: participant.bio ?? '',
        imageUrl: remoteImageUrl,
        paymentUrl: participant.paymentUrl,
        achievements: achievementsByParticipant.get(participant.id) ?? [],
      } satisfies PublicParticipant,
      categoryCode: parseCategory(categoryCode),
      categorySlug,
      categoryName,
      categoryOrder,
      stage: participant.stage,
    };
  });
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  const editionId = await getCurrentEditionId();
  const rows = await getPublicParticipants(editionId);
  const categoryRows = await database
    .select({
      id: dbCategories.id,
      code: dbCategories.code,
      slug: dbCategories.slug,
      label: dbCategories.label,
    })
    .from(dbCategories)
    .where(and(eq(dbCategories.editionId, editionId), eq(dbCategories.active, true)))
    .orderBy(asc(dbCategories.displayOrder), asc(dbCategories.label));

  return categoryRows.map((category) => ({
    id: category.id,
    name: category.label,
    slug: category.slug,
    abrev: parseCategory(category.code),
    list: rows
      .filter((row) => row.categorySlug === category.slug && row.stage === 'semifinalis')
      .map((row) => row.participant),
    finalist: rows
      .filter((row) => row.categorySlug === category.slug && row.stage === 'finalis')
      .map((row) => row.participant),
  }));
}

export async function getPublicCategoryBySlug(slug: string) {
  const category = (await getPublicCategories()).find((item) => item.slug === slug);
  if (!category) {
    throw new Error(`Turso category not found: ${slug}`);
  }
  return category;
}

export async function getPublicNavigation() {
  const edition = await getCurrentEdition();
  const now = new Date();
  const [categories, events, activeCampaign] = await Promise.all([
    getPublicCategories(),
    getPublicEvents(),
    database
      .select({ id: votingCampaigns.id })
      .from(votingCampaigns)
      .where(and(
        eq(votingCampaigns.editionId, edition.id),
        inArray(votingCampaigns.status, ['scheduled', 'active']),
        lte(votingCampaigns.startsAt, now),
        gte(votingCampaigns.endsAt, now),
      ))
      .limit(1),
  ]);
  return { categories, events, edition, votingActive: activeCampaign.length > 0 };
}

export async function getPublicVotingCampaign(): Promise<PublicVotingCampaign | null> {
  const editionId = await getCurrentEditionId();
  const [campaign] = await database
    .select()
    .from(votingCampaigns)
    .where(eq(votingCampaigns.editionId, editionId))
    .orderBy(desc(votingCampaigns.startsAt))
    .limit(1);
  return campaign ?? null;
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  const editionId = await getCurrentEditionId();
  const rows = await database
    .select({ slug: events.slug, label: events.label, description: events.description })
    .from(events)
    .where(and(eq(events.editionId, editionId), eq(events.active, true)))
    .orderBy(asc(events.displayOrder), asc(events.label));

  return rows.map((event) => ({
    slug: event.slug,
    label: event.label,
    desc: event.description ?? '',
    images: [],
  }));
}

export async function getPublicEventBySlug(slug: string) {
  const editionId = await getCurrentEditionId();
  const [eventRow] = await database
    .select({ id: events.id, slug: events.slug, label: events.label, description: events.description })
    .from(events)
    .where(and(eq(events.editionId, editionId), eq(events.slug, slug), eq(events.active, true)))
    .limit(1);

  if (!eventRow) {
    throw new Error(`Turso event not found: ${slug}`);
  }

  const imageRows = await database
    .select({ url: mediaAssets.url })
    .from(galleries)
    .innerJoin(galleryItems, eq(galleryItems.galleryId, galleries.id))
    .innerJoin(mediaAssets, eq(galleryItems.mediaId, mediaAssets.id))
    .where(and(eq(galleries.editionId, editionId), eq(galleries.ownerType, 'event'), eq(galleries.ownerId, eventRow.id), eq(galleryItems.active, true)))
    .orderBy(asc(galleryItems.displayOrder));

  const images = imageRows.map((item) => toRemoteUrl(item.url)).filter((item): item is string => Boolean(item));

  const event = {
    slug: eventRow.slug,
    label: eventRow.label,
    desc: eventRow.description ?? '',
    images,
  } satisfies PublicEvent;
  return event;
}

export async function getPublicSponsors(): Promise<PublicSponsor[]> {
  const editionId = await getCurrentEditionId();
  const rows = await database
    .select({ name: dbSponsors.name, imageUrl: mediaAssets.url })
    .from(dbSponsors)
    .leftJoin(mediaAssets, eq(dbSponsors.logoMediaId, mediaAssets.id))
    .where(and(eq(dbSponsors.editionId, editionId), eq(dbSponsors.active, true)))
    .orderBy(asc(dbSponsors.displayOrder), asc(dbSponsors.name));

  return rows.map((sponsor) => {
    const src = toRemoteUrl(sponsor.imageUrl);
    if (!src) {
      throw new Error(`Turso sponsor ${sponsor.name} has no remote logo`);
    }
    return { name: sponsor.name, src };
  });
}

export async function getPublicLegacyPageData() {
  const [finalistRows, sponsorRows] = await Promise.all([
    getFinalistsWithIncome(),
    getPublicSponsors(),
  ]);

  return {
    finalists: finalistRows.map((finalist) => ({
      id: finalist.id,
      name: finalist.name,
      title: `Finalis ${finalist.category}`,
    })),
    sponsors: sponsorRows,
  };
}

function parsePresentationItems(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
    if (typeof parsed === 'object' && parsed !== null && 'items' in parsed) {
      const items = (parsed as { items?: unknown }).items;
      return Array.isArray(items) ? items.filter((item): item is string => typeof item === 'string') : [];
    }
  } catch {
    return [];
  }
  return [];
}

export async function getPublicAboutContent(): Promise<PublicAboutContent> {
  const editionId = await getCurrentEditionId();
  const [missionSection, videoSection, peopleRows] = await Promise.all([
    database
      .select({ body: pageSections.body, presentationJson: pageSections.presentationJson })
      .from(pageSections)
      .where(and(eq(pageSections.editionId, editionId), eq(pageSections.pageKey, 'tentang'), eq(pageSections.sectionKey, 'misi'), eq(pageSections.status, 'published')))
      .limit(1),
    database
      .select({ presentationJson: pageSections.presentationJson })
      .from(pageSections)
      .where(and(eq(pageSections.editionId, editionId), eq(pageSections.pageKey, 'tentang'), eq(pageSections.sectionKey, 'video'), eq(pageSections.status, 'published')))
      .limit(1),
    database
      .select({
        name: people.name,
        position: organizationAssignments.title,
        group: organizationAssignments.group,
        termLabel: organizationAssignments.termLabel,
        displayOrder: organizationAssignments.displayOrder,
        imageUrl: mediaAssets.url,
      })
      .from(organizationAssignments)
      .innerJoin(people, eq(organizationAssignments.personId, people.id))
      .leftJoin(mediaAssets, eq(people.portraitMediaId, mediaAssets.id))
      .where(and(eq(organizationAssignments.editionId, editionId), eq(organizationAssignments.active, true)))
      .orderBy(asc(organizationAssignments.group), asc(organizationAssignments.displayOrder), asc(people.name)),
  ]);

  const mission = missionSection[0];
  const missionItems = parsePresentationItems(mission?.presentationJson);
  const fallbackMission = mission?.body?.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) ?? [];
  const videos = parsePresentationItems(videoSection[0]?.presentationJson);

  const makePerson = (row: typeof peopleRows[number]): PublicPerson => ({
    imageUrl: toRemoteUrl(row.imageUrl),
    name: row.name,
    position: row.group === 'ketua-sepanjang-masa' ? (row.termLabel ?? row.position) : row.position,
  });

  return {
    mission: missionItems.length ? missionItems : fallbackMission,
    pengurus: peopleRows.filter((row) => row.group === 'kepengurusan').map(makePerson),
    ketua: peopleRows.filter((row) => row.group === 'ketua-sepanjang-masa').map(makePerson),
    youtubeIds: videos,
  };
}

export async function getPublicNews(): Promise<PublicNewsItem[]> {
  const editionId = await getCurrentEditionId();
  const rows = await database
    .select({
      title: newsArticles.title,
      excerpt: newsArticles.excerpt,
      sourceUrl: newsArticles.sourceUrl,
      kind: newsArticles.kind,
      coverUrl: mediaAssets.url,
      publishedAt: newsArticles.publishedAt,
      createdAt: newsArticles.createdAt,
    })
    .from(newsArticles)
    .leftJoin(mediaAssets, eq(newsArticles.coverMediaId, mediaAssets.id))
    .where(and(eq(newsArticles.editionId, editionId), eq(newsArticles.status, 'published')))
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt));

  return rows.map((article) => ({
    title: article.title,
    description: article.excerpt ?? 'Berita dan informasi terbaru Paguyuban Mojang Jajaka Kabupaten Garut.',
    imageUrl: toRemoteUrl(article.coverUrl),
    date: article.publishedAt ?? article.createdAt,
    link: article.sourceUrl ?? '#',
    type: article.kind === 'file' ? 'file' : 'link',
  }));
}
