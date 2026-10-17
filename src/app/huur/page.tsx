import { SearchPage, searchMetadata, type SearchParams } from '@/components/search-page';

export const generateMetadata = ({ searchParams }: { searchParams: SearchParams }) => searchMetadata('huur', searchParams);

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <SearchPage mode="huur" searchParams={searchParams} />;
}
