import { SearchPage, searchMetadata, type SearchParams } from '@/components/search-page';

export const generateMetadata = ({ searchParams }: { searchParams: SearchParams }) => searchMetadata('koop', searchParams);

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <SearchPage mode="koop" searchParams={searchParams} />;
}
