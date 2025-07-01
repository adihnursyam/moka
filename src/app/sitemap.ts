import { categories, rangkaianKegiatan } from '@/lib/data';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pamokagarut.com';

  const votingCategoriesEntry = categories.map((category) => ({
    url: `${baseUrl}/voting/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.95,
  }))

  const hasilVotingEntry = categories.map((category) => ({
    url: `${baseUrl}/voting/hasil/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.90,
  }));

  const votingEntries = categories.map((category) => {
    return category.list.map((item) => ({
      url: `${baseUrl}/voting/${category.slug}/${item.name.split(' ').join('-').toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    }))
  });

  const allVotingEntries = [...(votingEntries.flat()), ...votingCategoriesEntry, ...hasilVotingEntry] as MetadataRoute.Sitemap

  const activityEntries = rangkaianKegiatan.map((activity) => ({
    url: `${baseUrl}/rangkaian-kegiatan/${activity.label.toLowerCase().
      replace(' ', '-')}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  })) as MetadataRoute.Sitemap;

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    ...allVotingEntries,
    ...activityEntries
  ];
}
