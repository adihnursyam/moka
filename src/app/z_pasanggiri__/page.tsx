import { getPublicLegacyPageData } from '@/server/cms/public-readers';
import LegacyPasanggiriClient from './client';

export default async function Pasanggiri() {
  const data = await getPublicLegacyPageData();
  return <LegacyPasanggiriClient {...data} />;
}
